import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_PORT = 4001;
const API_PREFIX = '/api/v1';

/**
 * Token JWT de desenvolvimento para autenticação na camada de segurança da API.
 * Enviado no header `x-dev-token` em todas as requisições.
 */
const DEV_TOKEN = process.env.EXPO_PUBLIC_DEV_TOKEN || '';

function resolveBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL;
  if (raw) {
    // Remove trailing slash if present
    const cleaned = raw.replace(/\/+$/, '');
    return `${cleaned}${API_PREFIX}`;
  }
  const hostUri = Constants.expoConfig?.hostUri?.split(':')[0];
  const ip = hostUri || '192.168.24.11';
  return `http://${ip}:${API_PORT}${API_PREFIX}`;
}

/** Base URL já incluindo o prefixo /api/v1 */
export const BASE_URL = resolveBaseUrl();

/**
 * Retorna os headers padrão para todas as requisições.
 * Inclui Content-Type, x-dev-token, e opcionalmente o Authorization Bearer.
 */
export async function getHeaders(includeAuth = true): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (DEV_TOKEN) {
    headers['x-dev-token'] = DEV_TOKEN;
  }

  if (includeAuth) {
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Retorna headers apenas com Content-Type e x-dev-token (sem Authorization).
 */
export async function getPublicHeaders(): Promise<Record<string, string>> {
  return getHeaders(false);
}
