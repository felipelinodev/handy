import { LoginPayload, RegisterPayload, AuthResponse } from '@/features/auth/types';
import { BASE_URL, getPublicHeaders } from '@/services/apiConfig';

class ApiError extends Error {
  field: string | null;
  constructor(message: string, field: string | null = null) {
    super(message);
    this.field = field;
  }
}

async function parseError(response: Response, fallback: string): Promise<ApiError> {
  let data: any = {};
  try {
    data = await response.json();
  } catch {
    // body wasn't JSON
  }
  const message = typeof data?.message === 'string' ? data.message : fallback;
  const field = typeof data?.field === 'string' ? data.field : null;
  return new ApiError(message, field);
}

export async function loginClient(payload: LoginPayload): Promise<AuthResponse> {
  const headers = await getPublicHeaders();
  const response = await fetch(`${BASE_URL}/client/login-client`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, 'Erro ao realizar o login.');
  }

  return (await response.json()) as AuthResponse;
}

export async function registerClient(payload: RegisterPayload): Promise<any> {
  const headers = await getPublicHeaders();
  const response = await fetch(`${BASE_URL}/client/create-client-account`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, 'Erro ao criar a conta.');
  }

  return await response.json();
}

export async function loginProvider(payload: LoginPayload): Promise<AuthResponse> {
  const headers = await getPublicHeaders();
  const response = await fetch(`${BASE_URL}/provider/login-service-provider`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, 'Erro ao realizar o login.');
  }

  return (await response.json()) as AuthResponse;
}

export async function registerProvider(payload: RegisterPayload): Promise<any> {
  const headers = await getPublicHeaders();
  const body: Record<string, any> = {
    nome: payload.nome,
    email: payload.email,
    cpf: payload.cpf,
    senha: payload.senha,
    tipo_usuario: 'prestador',
  };
  if (Array.isArray(payload.especialidades) && payload.especialidades.length > 0) {
    body.especialidades = payload.especialidades;
  }

  const response = await fetch(`${BASE_URL}/provider/create-service-provider-account`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseError(response, 'Erro ao criar a conta.');
  }

  return await response.json();
}
