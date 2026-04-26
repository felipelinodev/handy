import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

import type { CreateTicketInput, UpdateTicketInput } from "../types/support.types";

@Injectable()
export class SupportRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createTicket(data: CreateTicketInput) {
        return await this.prisma.ticket.create({
            data,
        });
    }

    async findAllTickets() {
        return await this.prisma.ticket.findMany({
            orderBy: { created_at: 'desc' },
        });
    }

    async findTicketById(ticketId: number) {
        return await this.prisma.ticket.findUnique({
            where: { ticket_id: ticketId },
        });
    }

    async findTicketsByUsuarioId(usuarioId: number) {
        return await this.prisma.ticket.findMany({
            where: { usuario_id: usuarioId },
            orderBy: { created_at: 'desc' },
        });
    }

    async updateTicket(ticketId: number, data: UpdateTicketInput) {
        return await this.prisma.ticket.update({
            where: { ticket_id: ticketId },
            data: {
                ...data,
                updated_at: new Date(),
            },
        });
    }

    async deleteTicket(ticketId: number) {
        return await this.prisma.ticket.delete({
            where: { ticket_id: ticketId },
        });
    }
}
