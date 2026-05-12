export type CreateServicoInput = {
  prestador_id: number;
  categoria_id: number;
  nome_servico: string;
  descricao?: string | null;
  preco: number;
  local?: Record<string, unknown> | null;
};

export type UpdateServicoInput = Partial<Omit<CreateServicoInput, 'prestador_id'>>;
