import { z } from "zod";

const createProviderAvailabilitySchema = z.object({

    prestador_id: z.number().int().positive('ID do prestador inválido.'),

    data_disponivel: z.string().min(1, 'A data disponível é obrigatória.'),

    hora_inicio: z.string().optional(),

    hora_fim: z.string().optional(),

    status: z.enum(['Livre', 'Reservado', 'Indisponível'], {
        message: 'Status deve ser: Livre, Reservado ou Indisponível.'
    }).optional().default('Livre'),

});

const updateProviderAvailabilitySchema = z.object({

    data_disponivel: z.string().min(1, 'A data disponível é obrigatória.').optional(),

    hora_inicio: z.string().optional(),

    hora_fim: z.string().optional(),

    status: z.enum(['Livre', 'Reservado', 'Indisponível'], {
        message: 'Status deve ser: Livre, Reservado ou Indisponível.'
    }).optional(),

    contratacao_id: z.number().int().positive('ID da contratação inválido.').nullable().optional(),
    
});

export type CreateProviderAvailabilityDto = z.infer<typeof createProviderAvailabilitySchema>;
export type UpdateProviderAvailabilityDto = z.infer<typeof updateProviderAvailabilitySchema>;
export { createProviderAvailabilitySchema, updateProviderAvailabilitySchema };

