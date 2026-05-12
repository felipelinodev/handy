import { z } from "zod";

export const createServiceSchema = z.object({
    prestador_id: z.number({ message: 'O ID do prestador é obrigatório.' }),
    categoria_id: z.number({ message: 'O ID da categoria é obrigatório.' }),
    nome_servico: z.string().min(1, 'É necessário adicionar o nome do serviço.').max(150, 'O nome do serviço deve ter no máximo 150 caracteres.'),
    descricao: z.string().max(1000, 'A descrição deve ter no máximo 1000 caracteres.').optional().nullable(),
    preco: z.number({ message: 'O preço é obrigatório.' }).positive('O preço deve ser um valor positivo.'),
    local: z.any().optional().nullable(),
});

export const updateServiceSchema = createServiceSchema.omit({ prestador_id: true }).partial();

export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>;
