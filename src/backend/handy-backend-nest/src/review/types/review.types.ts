export type CreateReviewInput = {
    contratacao_id: number;
    prestador_id: number;
    cliente_id: number;
    nota: number;
    comentario?: string | null;
};
