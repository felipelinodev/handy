export type CreateConversaInput = {
  contratacao_id: number;
  cliente_id: number;
  prestador_id: number;
  status?: string;
};

export type UpdateConversaInput = {
  status?: string;
};
