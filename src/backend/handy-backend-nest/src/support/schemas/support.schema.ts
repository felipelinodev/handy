import { z } from "zod";

const ticketCategorias = [
  'cancelamento',
  'reclamacao',
  'reembolso',
  'duvidas-gerais',
  'politicas',
  'problemas-com-prestador',
  'problemas-com-pagamento',
  'problemas-tecnicos',
  'conta-e-acesso',
  'denuncia',
  'sugestao',
] as const;

const ticketStatus = [
  'Aberto',
  'Em Andamento',
  'Resolvido',
  'Fechado',
] as const;

const supportSchema = z.object({

  titulo: z.string().min(1, 'O titulo do ticket e obrigatorio.').max(150, 'O titulo deve ter no maximo 150 caracteres.'),

  descricao: z.string().min(1, 'A descricao do ticket e obrigatoria.'),

  categoria: z.enum(ticketCategorias, { message: 'Categoria de ticket invalida.' }),

});

const updateTicketSchema = z.object({

  titulo: z.string().min(1, 'O titulo do ticket e obrigatorio.').max(150, 'O titulo deve ter no maximo 150 caracteres.').optional(),

  descricao: z.string().min(1, 'A descricao do ticket e obrigatoria.').optional(),

  categoria: z.enum(ticketCategorias, { message: 'Categoria de ticket invalida.' }).optional(),

  status: z.enum(ticketStatus, { message: 'Status de ticket invalido.' }).optional(),

});

export type CreateTicketDto = z.infer<typeof supportSchema>;
export type UpdateTicketDto = z.infer<typeof updateTicketSchema>;
export { supportSchema, updateTicketSchema };
