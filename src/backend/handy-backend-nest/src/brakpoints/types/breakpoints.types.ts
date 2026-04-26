export type CreateBreakpointInput = {
    prestador_id: number;
    cliente_id: number;
    mensagem_id: number;
    titulo: string;
    descricao?: string | null;
};

export type UpdateBreakpointInput = Partial<Omit<CreateBreakpointInput, 'prestador_id' | 'cliente_id' | 'mensagem_id'>>;
