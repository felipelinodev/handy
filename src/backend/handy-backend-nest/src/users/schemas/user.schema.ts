import { z } from "zod";
import { isValidCpf } from "../../../common/utils/cpf.validator";

const clientSchema = z.object({

    nome: z.string().min(1, 'É necessário adicionar um nome.'),

    email: z.email('O email digitado é inválido.'),

    senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),

    cpf: z.string().refine(isValidCpf, { message: "CPF inválido." }),

    tipo_usuario: z.literal('cliente').default('cliente'),

    photo_url: z.string().url('URL da foto inválida.').optional(),

    endereco: z.string().min(1, 'Precisa ter um endereço.').optional(),

    descricao: z.string().optional(),

});

export type CreateClientDto = z.infer<typeof clientSchema> // INJEÇÃO DE TIPOS ENTENDE?
export { clientSchema };