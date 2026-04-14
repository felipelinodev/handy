import { z } from "zod";
import { isValidCpf } from "../../../common/utils/cpf.validator";

export const providerSchema = z.object({
    nome: z.string().min(1, 'É necessário adicionar um nome.'),
    email: z.email('O email digitado é inválido.'),
    senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    cpf: z.string().refine(isValidCpf, { message: "CPF inválido." }).optional().nullable(),
    tipo_usuario: z.literal('prestador').default('prestador'),
    photo_url: z.string().url('URL da foto inválida.').optional().nullable(),
    endereco: z.string().min(1, 'Precisa ter um endereço.').optional().nullable(),
    descricao: z.string().max(500, 'A descrição deve ter no máximo 500 caracteres.').optional().nullable(),
    especialidades: z.array(z.number()).optional(), // Array de IDs das especialidades
});


export type CreateProviderDto = z.infer<typeof providerSchema>;
