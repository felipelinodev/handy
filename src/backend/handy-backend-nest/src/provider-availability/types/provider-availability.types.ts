export type CreateProviderAvailabilityInput = {
  prestador_id: number;
  data_disponivel: Date;
  hora_inicio?: Date | null;
  hora_fim?: Date | null;
  status?: string;
};

export type UpdateProviderAvailabilityInput = {
  data_disponivel?: Date;
  hora_inicio?: Date | null;
  hora_fim?: Date | null;
  status?: string;
  contratacao_id?: number | null;
};
