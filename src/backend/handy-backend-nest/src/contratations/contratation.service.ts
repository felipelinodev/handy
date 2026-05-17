import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BuscarPor, ContratationRepository } from './repository/contratations.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService, ContractPdfData } from './integrations/pdf/pdf.service';
import { AutentiqueService } from './integrations/autentique/autentique.service';

@Injectable()
export class ContratationService {
  private readonly logger = new Logger(ContratationService.name);

  constructor(
    private readonly contratationRepository: ContratationRepository,
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly autentiqueService: AutentiqueService,
  ) {}

  async createContratation(data: any) {
    const contratation = await this.contratationRepository.createContratation(data);
    this.logger.log(`Contratacao #${contratation.contratacao_id} criada.`);

    try {
      const clienteUsuario = await this.prisma.usuario.findUnique({
        where: { user_id: data.cliente_id },
      });
      const prestadorUsuario = await this.prisma.usuario.findUnique({
        where: { user_id: data.prestador_id },
      });

      if (!clienteUsuario || !prestadorUsuario) {
        this.logger.warn('Nao foi possivel localizar os usuarios para assinar o contrato.');
        return { message: 'Contratacao criada com sucesso.', data: contratation };
      }

      const servico = await this.prisma.servicos.findUnique({
        where: { servico_id: data.servico_id },
      });

      const precoFormatado = servico
        ? `R$ ${Number(servico.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : 'Conforme acordado';

      const pdfData: ContractPdfData = {
        titulo: contratation.titulo,
        clienteNome: clienteUsuario.nome,
        prestadorNome: prestadorUsuario.nome,
        servicoNome: servico?.nome_servico ?? contratation.titulo,
        preco: precoFormatado,
        modo: data.endereco ? 'presencial' : 'digital',
        endereco: data.endereco ?? undefined,
        observacoes: data.detalhes ?? undefined,
      };

      const pdfBuffer = await this.pdfService.gerarContratoPdf(pdfData);
      this.logger.log(`PDF gerado (${pdfBuffer.length} bytes).`);

      const nomeArquivo = `contrato_${contratation.contratacao_id}.pdf`;
      const signatarios = [
        { email: clienteUsuario.email, name: clienteUsuario.nome },
        { email: prestadorUsuario.email, name: prestadorUsuario.nome },
      ];

      const autentiqueDoc = await this.autentiqueService.criarContrato(
        `Contrato Handy #${contratation.contratacao_id} - ${contratation.titulo}`,
        signatarios,
        pdfBuffer,
        nomeArquivo,
      );

      const gatewayData = {
        document_id: autentiqueDoc.id,
        signatures: autentiqueDoc.signatures.map((s: any) => ({
          name: s.name,
          email: s.email,
          sign_url: s.sign_url,
        })),
      };

      const updatedContratation = await this.contratationRepository.atualizarContratacao(
        contratation.contratacao_id,
        {
          contract_gateway_id: autentiqueDoc.id,
          gateway_data: gatewayData,
        },
      );

      this.logger.log(`Contrato Autentique ID: ${autentiqueDoc.id} vinculado a contratacao #${contratation.contratacao_id}.`);

      return {
        message: 'Contratacao criada e contrato enviado para assinatura!',
        data: updatedContratation,
        autentique: {
          document_id: autentiqueDoc.id,
          signatures: autentiqueDoc.signatures,
        },
      };
    } catch (error) {
      this.logger.error(`Falha na integracao Autentique: ${error}`);
      return {
        message: 'Contratacao criada, porem houve falha ao enviar para assinatura digital.',
        data: contratation,
        error: String(error),
      };
    }
  }

  async viewContratation(id: number) {
    return this.contratationRepository.buscarContratacao('contratacao_id', id);
  }

  async getSignUrl(id: number, email: string) {
    const contratation = await this.contratationRepository.buscarContratacao('contratacao_id', id);
    if (!contratation) {
      throw new NotFoundException('Contratacao nao encontrada.');
    }

    const gateway = (contratation as any).gateway_data;
    if (!gateway?.signatures) {
      throw new NotFoundException('Dados de assinatura nao disponiveis para este contrato.');
    }

    const sig = gateway.signatures.find(
      (s: any) => s.email?.toLowerCase() === email.toLowerCase(),
    );

    if (!sig?.sign_url) {
      throw new NotFoundException('Link de assinatura nao encontrado para este email.');
    }

    return { sign_url: sig.sign_url };
  }

  async viewAllContratations() {
    return this.contratationRepository.buscarTodasContratacoes();
  }

  async updateContratation(id: number, data: any) {
    const contratation = await this.viewContratation(id);
    if (!contratation) {
      throw new NotFoundException('Contratacao nao encontrada para atualizar.');
    }

    const updatedContratation = await this.contratationRepository.atualizarContratacao(id, data);

    return {
      message: 'Dados da contratacao atualizados com sucesso!',
      contratation: updatedContratation,
    };
  }

  async cancelContratation(id: number) {
    const contratation = await this.viewContratation(id);

    if (!contratation) {
      throw new NotFoundException('Contratacao nao encontrada.');
    }

    await this.contratationRepository.deletarContratacao(id);

    return {
      message: 'Contratacao cancelada com sucesso!',
      contratation,
    };
  }
}
