export type CreateContratationInput = {
  cliente_id: number;
  prestador_id: number;
  servico_id: number;
  titulo: string;
  detalhes?: string | null;
  endereco?: string | null;
  inicio?: Date | null;
  conclusao?: Date | null;
  vencimento?: Date | null;
  contract_gateway_id?: string | null;
};
