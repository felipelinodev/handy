import AsyncStorage from '@react-native-async-storage/async-storage';

const API_PORT = 4001;

function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  return `http://192.168.18.180:${API_PORT}`;
}

const BASE_URL = resolveBaseUrl();

export interface ClientInfo {
  user_id: number;
  nome: string;
  email?: string;
  photo_url?: string | null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem('@auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchClientById(id: number): Promise<ClientInfo | null> {
  try {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/client/view-client/${id}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) return null;
    const data: any = await response.json();
    return {
      user_id: data?.user_id ?? id,
      nome: data?.nome ?? `Cliente #${id}`,
      email: data?.email,
      photo_url: data?.photo_url ?? null,
    };
  } catch {
    return null;
  }
}
