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
};

export type CreatePrestadorInput = {
  media_avaliacao?: number;
  total_clientes?: number;
};

export type UpdatePrestadorInput = Partial<CreateUsuarioInput> & {
  media_avaliacao?: number;
  total_clientes?: number;
};
