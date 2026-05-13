import { Injectable } from '@nestjs/common';
import { AnalysisRepository } from './repository/analysis.repository';
import { ServicesAnalysis, ClientsAnalysis } from './types/analysis.types';
import { Periodo, getStartDate } from 'common/utils/periodoDate';

@Injectable()
export class AnalysisService {
    constructor(private readonly analysisRepository: AnalysisRepository) { }

    async getContractedServicesAnalysis(
        prestador_id: number,
        periodo?: Periodo,
    ): Promise<ServicesAnalysis> {
        const startDate = getStartDate(periodo);

        const data = await this.analysisRepository.getContractedServices(prestador_id, startDate) as any[];

        const total_contratacoes = data.reduce(
            (sum, s) => sum + (s._count?.contratacoes || 0),
            0,
        );

        return {
            prestador_id,
            periodo,
            total_contratacoes,
            servicos: data.map((s) => ({
                servico_id: s.servico_id,
                nome_servico: s.nome_servico,
                total_contratacoes: s._count?.contratacoes || 0,
            })),
        };
    }

    async getRevenueAnalysis(
        prestador_id: number,
        periodo?: Periodo,
    ): Promise<ServicesAnalysis> {
        const startDate = getStartDate(periodo);

        const data = await this.analysisRepository.getRevenue(prestador_id, startDate) as any[];

        let total_revenue = 0;

        const servicos = data.map((s) => {
            const revenue = s.contratacoes.reduce((acc, c) => {
                return acc + c.pagamento.reduce((sum, p) => sum + Number(p.valor ?? 0), 0);
            }, 0);

            total_revenue += revenue;

            return {
                servico_id: s.servico_id,
                nome_servico: s.nome_servico,
                total_contratacoes: s.contratacoes.length,
                revenue,
            };
        });

        return {
            prestador_id,
            periodo,
            total_revenue,
            servicos,
        };
    }

    async getPerformanceAnalysis(
        prestador_id: number,
        periodo?: Periodo,
    ): Promise<ServicesAnalysis> {
        const startDate = getStartDate(periodo);

        const data = await this.analysisRepository.getPerformance(prestador_id, startDate) as any[];

        let totalNotas = 0;
        let totalAvaliacoes = 0;

        const servicos = data.map((s) => {
            const notas = s.contratacoes
                .map((c) => c.avaliacao?.nota)
                .filter((n): n is number => n !== undefined);

            const media =
                notas.length > 0
                    ? Number((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1))
                    : 0;

            totalNotas += notas.reduce((a, b) => a + b, 0);
            totalAvaliacoes += notas.length;

            return {
                servico_id: s.servico_id,
                nome_servico: s.nome_servico,
                media_avaliacao: media,
            };
        });

        const media_avaliacao =
            totalAvaliacoes > 0
                ? Number((totalNotas / totalAvaliacoes).toFixed(1))
                : 0;

        return {
            prestador_id,
            periodo,
            media_avaliacao,
            servicos,
        };
    }

    async listServiceProviderClients(prestador_id: number, periodo?: Periodo): Promise<ClientsAnalysis> {
        const startDate = getStartDate(periodo);

        const data = await this.analysisRepository.listClients(prestador_id, startDate) as any[];

        const grouped = new Map<number, { cliente_id: number; nome: string; total_contratacoes: number }>();

        for (const c of data) {
            const existing = grouped.get(c.cliente_id);
            if (existing) {
                existing.total_contratacoes += 1;
            } else {
                grouped.set(c.cliente_id, {
                    cliente_id: c.cliente_id,
                    nome: c.cliente.usuario.nome,
                    total_contratacoes: 1,
                });
            }
        }

        const clientes = Array.from(grouped.values());

        return {
            prestador_id,
            periodo,
            total_clientes: clientes.length,
            clientes,
        };
    }
}