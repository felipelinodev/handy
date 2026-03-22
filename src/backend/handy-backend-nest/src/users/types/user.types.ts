// Tipos para criação de registros
// Esses tipos definem os campos necessários para criar um usuário ou cliente

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

export type CreateClienteInput = {
  user_id: number;
};
