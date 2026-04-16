import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalysisRepository {
  constructor(private readonly prisma: PrismaService) { }

  async getContractedServices(prestador_id: number, startDate?: Date) {
    return this.prisma.servicos.findMany({
      where: { prestador_id },
      select: {
        servico_id: true,
        nome_servico: true,
        _count: {
          select: {
            contratacoes: {
              where: {
                status: { in: ['Concluido', 'Cancelado'] },
                ...(startDate && { created_at: { gte: startDate } }),
              },
            },
          },
        },
      },
    });
  }

  async getRevenue(prestador_id: number, startDate?: Date) {
    return this.prisma.servicos.findMany({
      where: { prestador_id },
      select: {
        servico_id: true,
        nome_servico: true,
        contratacoes: {
          where: {
            status: 'Concluido',
            ...(startDate && { created_at: { gte: startDate } }),
          },
          select: {
            pagamento: {
              where: { status: 'Pago' },
              select: { valor: true },
            },
          },
        },
      },
    });
  }

  async getPerformance(prestador_id: number, startDate?: Date) {
    return this.prisma.servicos.findMany({
      where: { prestador_id },
      select: {
        servico_id: true,
        nome_servico: true,
        contratacoes: {
          where: {
            avaliacao: { isNot: null },
            ...(startDate && { created_at: { gte: startDate } }),
          },
          select: {
            avaliacao: { select: { nota: true } },
          },
        },
      },
    });
  }

  async listClients(prestador_id: number, startDate?: Date) {
    return this.prisma.contratacoes.findMany({
      where: {
        prestador_id,
        ...(startDate && { created_at: { gte: startDate } }),
      },
      select: {
        cliente_id: true,
        cliente: {
          select: {
            usuario: { select: { nome: true } },
          },
        },
      },
    });
  }
}