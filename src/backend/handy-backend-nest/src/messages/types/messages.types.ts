export type CreateMensagemInput = {
  conversa_id: number;
  remetente_id: number;
  conteudo: string;
  remetente_tipo?: string;
  status?: string;
  anexo_url?: string;
};
