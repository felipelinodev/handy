import { z } from 'zod';

export const periodoEnum = z.enum(['1 semana', '1 mes', '3 meses', '6 meses', '1 ano', 'total']);

export const analysisRequestSchema = z.object({
  prestador_id: z.coerce.number().int().positive('ID do prestador inválido.'),
  periodo: periodoEnum.optional(),
});

const analysisServiceItemSchema = z.object({
  servico_id: z.number().int().positive('ID do serviço inválido.'),
  nome_servico: z.string().min(1, 'Nome do serviço inválido.'),
  total_contratacoes: z.number().int().nonnegative().optional(),
  revenue: z.number().nonnegative().optional(),
  media_avaliacao: z.number().min(0).max(5).optional(),
});

export const servicesAnalysisSchema = z.object({
  prestador_id: z.number().int().positive(),
  periodo: periodoEnum.optional(),
  total_revenue: z.number().nonnegative().optional(),
  total_contratacoes: z.number().int().nonnegative().optional(),
  media_avaliacao: z.number().min(0).max(5).optional(),
  servicos: z.array(analysisServiceItemSchema),
});

export const clientsAnalysisSchema = z.object({
  prestador_id: z.number().int().positive(),
  periodo: periodoEnum.optional(),
  total_clientes: z.number().int().nonnegative(),
  clientes: z.array(
    z.object({
      cliente_id: z.number().int().positive(),
      nome: z.string().min(1, 'Nome do cliente inválido.'),
      total_contratacoes: z.number().int().nonnegative(),
    }),
  ),
});