import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

import type { CreateMensagemInput } from "../types/messages.types";

@Injectable()
export class MessagesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createMensagem(data: CreateMensagemInput) {
        return await this.prisma.mensagem.create({
            data,
        });
    }

    async findMensagensByConversaId(conversaId: number) {
        return await this.prisma.mensagem.findMany({
            where: { conversa_id: conversaId },
            orderBy: { created_at: 'asc' },
        });
    }

    async findAllMensagens() {
        return await this.prisma.mensagem.findMany({
            orderBy: { created_at: 'desc' },
        });
    }

    async deleteMensagem(mensagemId: number) {
        return await this.prisma.mensagem.delete({
            where: { mensagem_id: mensagemId },
        });
    }

    async createConversaEIniciaMensagem(data: {
        contratacao_id: number;
        cliente_id: number;
        prestador_id: number;
        remetente_id: number;
        conteudo: string;
        remetente_tipo?: string;
        anexo_url?: string;
    }) {
        const novaConversa = await this.prisma.conversa.create({
            data: {
                contratacao_id: data.contratacao_id,
                cliente_id: data.cliente_id,
                prestador_id: data.prestador_id,
                status: 'Aberta',
            }
        });

        const novaMensagem = await this.prisma.mensagem.create({
            data: {
                conversa_id: novaConversa.conversa_id,
                remetente_id: data.remetente_id,
                conteudo: data.conteudo,
                remetente_tipo: data.remetente_tipo,
                anexo_url: data.anexo_url,
            }
        });

        return { chat: novaConversa, mensagem: novaMensagem };
    }
}
