import { z } from "zod";

const conversaSchema = z.object({
  contratacao_id: z.number().int().positive("ID da contratação inválido."),
  cliente_id: z.number().int().positive("ID do cliente inválido."),
  prestador_id: z.number().int().positive("ID do prestador inválido."),
  status: z.string().optional(),
});

const updateConversaSchema = z.object({
  status: z.string().min(1, "O status não pode estar vazio."),
});

export type CreateConversaDto = z.infer<typeof conversaSchema>;
export type UpdateConversaDto = z.infer<typeof updateConversaSchema>;

export { conversaSchema, updateConversaSchema };
