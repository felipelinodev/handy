import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportRepository } from './repository/support.repository';

import type { CreateTicketInput, UpdateTicketInput } from './types/support.types';

@Injectable()
export class SupportService {

  constructor(private readonly supportRepository: SupportRepository) {}

  async createTicket(usuarioId: number, data: { titulo: string; descricao: string; categoria: string }) {
    const ticketData: CreateTicketInput = {
      usuario_id: usuarioId,
      titulo: data.titulo,
      descricao: data.descricao,
      categoria: data.categoria,
    };

    const ticket = await this.supportRepository.createTicket(ticketData);

    return {
      message: 'Ticket criado com sucesso.',
      ticket,
    };
  }

  async viewTickets(usuarioId: number) {
    const tickets = await this.supportRepository.findTicketsByUsuarioId(usuarioId);

    return {
      total: tickets.length,
      tickets,
    };
  }

  async viewAllTickets() {
    const tickets = await this.supportRepository.findAllTickets();

    return {
      total: tickets.length,
      tickets,
    };
  }

  async viewATicket(ticketId: number) {
    const ticket = await this.supportRepository.findTicketById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket nao encontrado.');
    }

    return ticket;
  }

  async updateTicket(ticketId: number, data: UpdateTicketInput) {
    const ticket = await this.supportRepository.findTicketById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket nao encontrado para atualizar.');
    }

    const updatedTicket = await this.supportRepository.updateTicket(ticketId, data);

    return {
      message: 'Ticket atualizado com sucesso.',
      ticket: updatedTicket,
    };
  }

  async deleteTicket(ticketId: number) {
    const ticket = await this.supportRepository.findTicketById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket nao encontrado para excluir.');
    }

    await this.supportRepository.deleteTicket(ticketId);

    return {
      message: 'Ticket excluido com sucesso.',
      ticket,
    };
  }
}
