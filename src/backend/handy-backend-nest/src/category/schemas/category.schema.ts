import { z } from "zod";

const categorySchema = z.object({
    nome_categoria: z.string().min(1, 'É necessário adicionar um nome da categoria.'),
    rank_categoria: z.number().optional().default(0),
});

export type CreateCategoryDto = z.infer<typeof categorySchema>;
export { categorySchema };
