import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './repository/messages.repository';

import type { CreateMensagemInput } from './types/messages.types';

@Injectable()
export class MessagesService {

  constructor(private readonly messagesRepository: MessagesRepository) {}

  async viewMenssages(conversaId: number) {
    const messages = await this.messagesRepository.findMensagensByConversaId(conversaId);

    return {
      total: messages.length,
      messages,
    };
  }

  async viewAllMenssages() {
    const messages = await this.messagesRepository.findAllMensagens();

    return {
      total: messages.length,
      messages,
    };
  }

  async createMenssage(data: CreateMensagemInput) {
    const mensagem = await this.messagesRepository.createMensagem(data);

    return {
      message: 'Mensagem enviada com sucesso.',
      mensagem,
    };
  }

  async createNewMenssage(data: {
    contratacao_id: number;
    cliente_id: number;
    prestador_id: number;
    remetente_id: number;
    conteudo: string;
    remetente_tipo?: string;
    anexo_url?: string;
  }) {
    const resultado = await this.messagesRepository.createConversaEIniciaMensagem(data);

    return {
      message: 'Conversa iniciada e primeira mensagem enviada com sucesso.',
      chat: resultado.chat,
      mensagem: resultado.mensagem,
    };
  }

  async deleteMenssage(mensagemId: number) {
    await this.messagesRepository.deleteMensagem(mensagemId);

    return {
      message: 'Mensagem excluída com sucesso.',
    };
  }
}
