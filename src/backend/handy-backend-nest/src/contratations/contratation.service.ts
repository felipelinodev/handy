import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { BuscarPor, ContratationRepository } from './repository/contratations.repository';

@Injectable()
export class ContratationService {
  
  constructor(private readonly contratationRepository: ContratationRepository) {}

  async createContratation(data: any){
    const contratation = await this.contratationRepository.createContratation(data);
    return { message: 'Contratação criada com sucesso.', data: contratation };
  }

  async viewContratation(id: number){
    return this.contratationRepository.buscarContratacao('contratacao_id', id);
  }

  async viewAllContratations(){
    return this.contratationRepository.buscarTodasContratacoes();
  }

  async updateContratation(id: number, data: any) {
    const contratation = await this.viewContratation(id);
    if (!contratation) {
      throw new NotFoundException('Contratação não encontrada para atualizar.');
    }

    const updatedContratation = await this.contratationRepository.atualizarContratacao(id, data);

    return {
      message: 'Dados da contratação atualizados com sucesso!',
      contratation: updatedContratation
    };
  }

  async cancelContratation(id: number, chaveAdmin: string){
    if(chaveAdmin !== process.env.CHAVE_ADMIN){
      throw new UnauthorizedException('Você não tem permissão para cancelar essa contratação.');
    }

    const contratation = await this.viewContratation(id);
    
    if (!contratation) {
      throw new NotFoundException('Contratação não encontrada.');
    }

    await this.contratationRepository.deletarContratacao(id);

    return {
        message: 'Contratação cancelada com sucesso!',
        contratation,
    };
  }
}
