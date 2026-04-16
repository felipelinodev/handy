import { z } from "zod";

const contratationSchema = z.object({

    cliente_id: z.number().int().positive('ID do cliente inválido.'),

    prestador_id: z.number().int().positive('ID do prestador inválido.'),

    servico_id: z.number().int().positive('ID do serviço inválido.'),

    titulo: z.string().min(1, 'É necessário adicionar um título.'),

    detalhes: z.string().optional(),

    endereco: z.string().min(1, 'Precisa ter um endereço.').optional(),

    inicio: z.string().datetime('Data de início inválida.').optional(),

    conclusao: z.string().datetime('Data de conclusão inválida.').optional(),

    vencimento: z.string().datetime('Data de vencimento inválida.').optional(),

});

export type CreateContratationDto = z.infer<typeof contratationSchema>
export { contratationSchema };
