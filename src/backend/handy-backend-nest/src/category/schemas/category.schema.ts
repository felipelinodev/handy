import { z } from "zod";

const categorySchema = z.object({
    nome_categoria: z.string().min(1, 'É necessário adicionar um nome da categoria.'),
    rank_categoria: z.number().optional().default(0),
    icon_tag: z.string().max(100, 'O icon_tag deve ter no máximo 100 caracteres.').optional().nullable(),
});

export type CreateCategoryDto = z.infer<typeof categorySchema>;
export { categorySchema };
