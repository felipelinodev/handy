import { Injectable, NotFoundException } from '@nestjs/common';
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

  async deleteContratation(id: number){
    const contratation = await this.viewContratation(id);
    
    if (!contratation) {
      throw new NotFoundException('Contratação não encontrada.');
    }

    await this.contratationRepository.deletarContratacao(id);

    return {
        message: 'Contratação excluída com sucesso!',
        contratation,
    };
  }
}
