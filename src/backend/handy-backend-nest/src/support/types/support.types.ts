export type CreateTicketInput = {
  usuario_id: number;
  titulo: string;
  descricao: string;
  categoria: string;
};

export type UpdateTicketInput = {
  titulo?: string;
  descricao?: string;
  categoria?: string;
  status?: string;
};

export type TicketCategoria =
  | 'cancelamento'
  | 'reclamacao'
  | 'reembolso'
  | 'duvidas-gerais'
  | 'politicas'
  | 'problemas-com-prestador'
  | 'problemas-com-pagamento'
  | 'problemas-tecnicos'
  | 'conta-e-acesso'
  | 'denuncia'
  | 'sugestao';
