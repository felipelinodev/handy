import { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function loginClient(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/client/login-client`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao realizar o login.');
  }

  return data as AuthResponse;
}

export async function registerClient(payload: RegisterPayload): Promise<any> {
  const response = await fetch(`${BASE_URL}/client/create-client-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao criar a conta.');
  }

  return data;
}
