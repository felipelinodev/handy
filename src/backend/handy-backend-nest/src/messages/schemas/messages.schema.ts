import { z } from "zod";

const mensagemSchema = z.object({
  conversa_id: z.number().int().positive("ID da conversa inválido."),
  remetente_id: z.number().int().positive("ID do remetente inválido."),
  conteudo: z.string().min(1, "O conteúdo da mensagem é obrigatório."),
  remetente_tipo: z.string().optional(),
  anexo_url: z.string().url("URL de anexo inválida.").optional().or(z.literal("")),
});

const createNewMensagemSchema = z.object({
  contratacao_id: z.number().int().positive("ID da contratação inválido."),
  cliente_id: z.number().int().positive("ID do cliente inválido."),
  prestador_id: z.number().int().positive("ID do prestador inválido."),
  remetente_id: z.number().int().positive("ID do remetente inválido."),
  conteudo: z.string().min(1, "O conteúdo da mensagem é obrigatório."),
  remetente_tipo: z.string().optional(),
  anexo_url: z.string().url("URL de anexo inválida.").optional().or(z.literal("")),
});

export type CreateMensagemDto = z.infer<typeof mensagemSchema>;
export type CreateNewMensagemDto = z.infer<typeof createNewMensagemSchema>;

export { mensagemSchema, createNewMensagemSchema };
