import Constants from 'expo-constants';
import { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth';

const API_PORT = 4001;

function resolveBaseUrl(): string {
  // Prioriza variável de ambiente se definida
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Tenta extrair IP automático do Expo
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ??
    (Constants as any)?.expoGoConfig?.debuggerHost;

  if (hostUri) {
    const host = String(hostUri).split(':')[0];
    return `http://${host}:${API_PORT}`;
  }

  // Fallback para localhost (apenas para web/ios)
  return `http://localhost:${API_PORT}`;
}

const BASE_URL = resolveBaseUrl();

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
  const response = await fetch(`${BASE_URL}/client/login-client`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, 'Erro ao realizar o login.');
  }

  return (await response.json()) as AuthResponse;
}

export async function registerClient(payload: RegisterPayload): Promise<any> {
  const response = await fetch(`${BASE_URL}/client/create-client-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, 'Erro ao criar a conta.');
  }

  return await response.json();
}

export async function loginProvider(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/provider/login-service-provider`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseError(response, 'Erro ao realizar o login.');
  }

  return (await response.json()) as AuthResponse;
}

export async function registerProvider(payload: RegisterPayload): Promise<any> {
  const response = await fetch(`${BASE_URL}/provider/create-service-provider-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, tipo_usuario: 'prestador' }),
  });

  if (!response.ok) {
    throw await parseError(response, 'Erro ao criar a conta.');
  }

  return await response.json();
}
