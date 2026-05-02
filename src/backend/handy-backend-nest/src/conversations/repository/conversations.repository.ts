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

    async findConversaByContratacao(contratacaoId: number) {
        return await this.prisma.conversa.findUnique({
            where: { contratacao_id: contratacaoId },
            include: {
                mensagem: {
                    orderBy: { created_at: 'desc' },
                    take: 1,
                },
            },
        });
    }

    async findContratacaoBasic(contratacaoId: number) {
        return await this.prisma.contratacoes.findUnique({
            where: { contratacao_id: contratacaoId },
            select: {
                contratacao_id: true,
                cliente_id: true,
                prestador_id: true,
                titulo: true,
            },
        });
    }

    async createConversaWithSeedMessage(data: {
        contratacao_id: number;
        cliente_id: number;
        prestador_id: number;
        seedConteudo: string;
    }) {
        const novaConversa = await this.prisma.conversa.create({
            data: {
                contratacao_id: data.contratacao_id,
                cliente_id: data.cliente_id,
                prestador_id: data.prestador_id,
                status: 'Aberta',
            },
        });
        const seedMensagem = await this.prisma.mensagem.create({
            data: {
                conversa_id: novaConversa.conversa_id,
                remetente_id: data.prestador_id,
                conteudo: data.seedConteudo,
                remetente_tipo: 'prestador',
            },
        });
        return { conversa: novaConversa, mensagem: seedMensagem };
    }

    async createSeedMessageForConversa(conversaId: number, remetenteId: number, conteudo: string) {
        return await this.prisma.mensagem.create({
            data: {
                conversa_id: conversaId,
                remetente_id: remetenteId,
                conteudo,
                remetente_tipo: 'prestador',
            },
        });
    }

    async findConversasByPrestador(prestadorId: number) {
        return await this.prisma.conversa.findMany({
            where: { prestador_id: prestadorId },
            orderBy: { updated_at: 'desc' },
            include: {
                cliente: {
                    include: {
                        usuario: {
                            select: { user_id: true, nome: true, photo_url: true },
                        },
                    },
                },
                contratacoes: {
                    select: {
                        contratacao_id: true,
                        titulo: true,
                        status: true,
                    },
                },
                mensagem: {
                    orderBy: { created_at: 'desc' },
                    take: 1,
                    select: {
                        mensagem_id: true,
                        conteudo: true,
                        created_at: true,
                    },
                },
            },
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
