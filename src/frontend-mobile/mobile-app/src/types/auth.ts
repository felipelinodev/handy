export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

export interface AuthUser {
  user_id: number;
  nome: string;
  email: string;
  [key: string]: any;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
