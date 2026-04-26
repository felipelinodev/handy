import { z } from "zod";

export const reviewSchema = z.object({
    contratacao_id: z.number({ message: 'O ID da contratação é obrigatório.' }),
    prestador_id: z.number({ message: 'O ID do prestador é obrigatório.' }),
    cliente_id: z.number({ message: 'O ID do cliente é obrigatório.' }),
    nota: z.number({ message: 'A nota é obrigatória.' }).min(1, 'A nota mínima é 1.').max(5, 'A nota máxima é 5.'),
    comentario: z.string().optional().nullable(),
});

export type CreateReviewDto = z.infer<typeof reviewSchema>;
