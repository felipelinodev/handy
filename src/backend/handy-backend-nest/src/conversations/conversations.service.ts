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
