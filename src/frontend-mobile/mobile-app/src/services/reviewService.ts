import AsyncStorage from '@react-native-async-storage/async-storage';

const API_PORT = 4001;

function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const hostUri = Constants.expoConfig?.hostUri?.split(':')[0];
  const ip = hostUri || '192.168.24.6';
  return `http://${ip}:${API_PORT}`;
}

const BASE_URL = resolveBaseUrl();

export interface CreateReviewPayload {
  contratacao_id: number;
  prestador_id: number;
  cliente_id: number;
  nota: number;
  comentario?: string;
}

export async function createReview(payload: CreateReviewPayload) {
  const token = await AsyncStorage.getItem('@auth_token');

  const response = await fetch(`${BASE_URL}/review/create-new-review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      typeof data?.message === 'string'
        ? data.message
        : 'Não foi possível enviar a avaliação.';
    throw new Error(msg);
  }

  return data;
}
