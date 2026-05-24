import { BASE_URL, getHeaders } from '@/services/apiConfig';

export interface CreateReviewPayload {
  contratacao_id: number;
  prestador_id: number;
  cliente_id: number;
  nota: number;
  comentario?: string;
}

export async function createReview(payload: CreateReviewPayload) {
  const headers = await getHeaders();

  const response = await fetch(`${BASE_URL}/review/create-new-review`, {
    method: 'POST',
    headers,
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

export interface ReviewItem {
  avaliacao_id: number;
  contratacao_id: number;
  prestador_id: number;
  cliente_id: number;
  nota: number;
  comentario: string | null;
  created_at: string | null;
}

export async function fetchReviewsByPrestador(prestadorId: number | string): Promise<ReviewItem[]> {
  const headers = await getHeaders();

  const response = await fetch(`${BASE_URL}/review/view-all-review/${prestadorId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) return [];

  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}
