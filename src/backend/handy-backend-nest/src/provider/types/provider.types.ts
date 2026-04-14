// Esses tipos definem os campos necessários para criar um usuário ou prestador

export type CreateUsuarioInput = {
  nome: string;
  email: string;
  hash_password: string;
  cpf?: string | null;
  tipo_usuario: string;
  photo_url?: string | null;
  endereco?: string | null;
  descricao?: string | null;
  especialidades?: number[]; // Adicionado campo de especialidades
};

export type CreatePrestadorInput = {
  media_avaliacao?: number;
  total_clientes?: number;
};

export type UpdatePrestadorInput = Partial<CreateUsuarioInput> & {
  media_avaliacao?: number;
  total_clientes?: number;
};

export type CreateServicoInput = {
  prestador_id: number;
  categoria_id: number;
  nome_servico: string;
  descricao?: string | null;
  preco: number;
};
