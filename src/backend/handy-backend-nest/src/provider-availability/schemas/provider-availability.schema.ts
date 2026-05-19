import { z } from "zod";

const createProviderAvailabilitySchema = z.object({

    prestador_id: z.number().int().positive('ID do prestador inválido.'),

    data_disponivel: z.string().min(1, 'A data disponível é obrigatória.').transform(val => new Date(val + 'T00:00:00.000Z')),

    hora_inicio: z.string().optional().transform(val => val ? new Date(`1970-01-01T${val}.000Z`) : undefined),

    hora_fim: z.string().optional().transform(val => val ? new Date(`1970-01-01T${val}.000Z`) : undefined),

    status: z.enum(['Livre', 'Reservado', 'Indisponível'], {
        message: 'Status deve ser: Livre, Reservado ou Indisponível.'
    }).optional().default('Livre'),

});

const updateProviderAvailabilitySchema = z.object({

    data_disponivel: z.string().min(1, 'A data disponível é obrigatória.').optional().transform(val => val ? new Date(val + 'T00:00:00.000Z') : undefined),

    hora_inicio: z.string().optional().transform(val => val ? new Date(`1970-01-01T${val}.000Z`) : undefined),

    hora_fim: z.string().optional().transform(val => val ? new Date(`1970-01-01T${val}.000Z`) : undefined),

    status: z.enum(['Livre', 'Reservado', 'Indisponível'], {
        message: 'Status deve ser: Livre, Reservado ou Indisponível.'
    }).optional(),

    contratacao_id: z.number().int().positive('ID da contratação inválido.').nullable().optional(),

});

export type CreateProviderAvailabilityDto = z.infer<typeof createProviderAvailabilitySchema>;
export type UpdateProviderAvailabilityDto = z.infer<typeof updateProviderAvailabilitySchema>;
export { createProviderAvailabilitySchema, updateProviderAvailabilitySchema };

