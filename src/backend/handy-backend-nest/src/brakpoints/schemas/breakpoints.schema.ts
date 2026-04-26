import { z } from "zod";

export const breakpointSchema = z.object({
    prestador_id: z.number({ message: 'O ID do prestador é obrigatório.' }),
    cliente_id: z.number({ message: 'O ID do cliente é obrigatório.' }),
    mensagem_id: z.number({ message: 'O ID da mensagem é obrigatório.' }),
    titulo: z.string().min(1, 'É necessário adicionar um título.').max(100, 'O título deve ter no máximo 100 caracteres.'),
    descricao: z.string().optional().nullable(),
});

export type CreateBreakpointDto = z.infer<typeof breakpointSchema>;
