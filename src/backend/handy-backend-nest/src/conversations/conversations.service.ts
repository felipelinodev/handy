import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationsRepository } from './repository/conversations.repository';
import type { CreateConversaInput } from './types/conversations.types';

@Injectable()
export class ConversationsService {
  constructor(private readonly conversationsRepository: ConversationsRepository) {}

  async createNewChat(data: CreateConversaInput) {
    const chat = await this.conversationsRepository.createConversa(data);
    return {
      message: 'Conversa criada com sucesso.',
      chat,
    };
  }

  async viewChat(conversaId: number) {
    const chat = await this.conversationsRepository.findConversaById(conversaId);
    if (!chat) {
      throw new NotFoundException('Conversa não encontrada.');
    }
    return chat;
  }

  async ensureByContratacao(contratacaoId: number) {
    const contratacao = await this.conversationsRepository.findContratacaoBasic(contratacaoId);
    if (!contratacao) {
      throw new NotFoundException('Contratação não encontrada.');
    }

    const seedConteudo = `Conversa iniciada para o contrato "${contratacao.titulo}".`;
    let conversa = await this.conversationsRepository.findConversaByContratacao(contratacaoId);

    if (!conversa) {
      const created = await this.conversationsRepository.createConversaWithSeedMessage({
        contratacao_id: contratacao.contratacao_id,
        cliente_id: contratacao.cliente_id,
        prestador_id: contratacao.prestador_id,
        seedConteudo,
      });
      return {
        conversa_id: created.conversa.conversa_id,
        contratacao_id: contratacao.contratacao_id,
        cliente_id: contratacao.cliente_id,
        prestador_id: contratacao.prestador_id,
        mensagem_id: created.mensagem.mensagem_id,
        created: true,
      };
    }

    let mensagemId = conversa.mensagem?.[0]?.mensagem_id;
    if (!mensagemId) {
      const seed = await this.conversationsRepository.createSeedMessageForConversa(
        conversa.conversa_id,
        contratacao.prestador_id,
        seedConteudo,
      );
      mensagemId = seed.mensagem_id;
    }

    return {
      conversa_id: conversa.conversa_id,
      contratacao_id: contratacao.contratacao_id,
      cliente_id: contratacao.cliente_id,
      prestador_id: contratacao.prestador_id,
      mensagem_id: mensagemId,
      created: false,
    };
  }

  async listByPrestador(prestadorId: number) {
    const list = await this.conversationsRepository.findConversasByPrestador(prestadorId);
    return list.map((c: any) => ({
      conversa_id: c.conversa_id,
      contratacao_id: c.contratacao_id,
      cliente_id: c.cliente_id,
      cliente_nome: c.cliente?.usuario?.nome ?? null,
      cliente_photo_url: c.cliente?.usuario?.photo_url ?? null,
      contratacao_titulo: c.contratacoes?.titulo ?? null,
      contratacao_status: c.contratacoes?.status ?? null,
      ultima_mensagem_id: c.mensagem?.[0]?.mensagem_id ?? null,
      ultima_mensagem_conteudo: c.mensagem?.[0]?.conteudo ?? null,
      ultima_mensagem_at: c.mensagem?.[0]?.created_at ?? null,
      status: c.status,
    }));
  }

  async updateChat(conversaId: number, status: string) {
    const chat = await this.conversationsRepository.findConversaById(conversaId);
    if (!chat) {
      throw new NotFoundException('Conversa não encontrada para atualizar.');
    }
    const updatedChat = await this.conversationsRepository.updateConversaStatus(conversaId, status);
    return {
      message: 'Conversa atualizada com sucesso.',
      chat: updatedChat,
    };
  }

  async deleteChat(conversaId: number) {
    const chat = await this.conversationsRepository.findConversaById(conversaId);
    if (!chat) {
      throw new NotFoundException('Conversa não encontrada para excluir.');
    }
    await this.conversationsRepository.deleteConversa(conversaId);
    return {
      message: 'Conversa excluída com sucesso.',
    };
  }
}
