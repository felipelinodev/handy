import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateConversaInput } from "../types/conversations.types";

@Injectable()
export class ConversationsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createConversa(data: CreateConversaInput) {
        return await this.prisma.conversa.create({
            data,
        });
    }

    async findConversaById(conversaId: number) {
        return await this.prisma.conversa.findUnique({
            where: { conversa_id: conversaId },
            include: {
                mensagem: true,
            }
        });
    }

    async updateConversaStatus(conversaId: number, status: string) {
        return await this.prisma.conversa.update({
            where: { conversa_id: conversaId },
            data: { 
                status,
                updated_at: new Date()
            },
        });
    }

    async deleteConversa(conversaId: number) {
        return await this.prisma.conversa.delete({
            where: { conversa_id: conversaId },
        });
    }
}
