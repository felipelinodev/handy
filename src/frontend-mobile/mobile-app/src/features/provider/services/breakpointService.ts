import { BASE_URL, getHeaders } from '@/services/apiConfig';

export interface BackendBreakpoint {
  breakpoint_id: number;
  prestador_id: number;
  cliente_id: number;
  mensagem_id: number;
  titulo: string;
  descricao: string | null;
  data_criacao: string | null;
}

export interface CreateBreakpointPayload {
  prestador_id: number;
  cliente_id: number;
  mensagem_id: number;
  titulo: string;
  descricao?: string | null;
}

export interface UpdateBreakpointPayload {
  titulo?: string;
  descricao?: string | null;
}

export async function createBreakpoint(
  payload: CreateBreakpointPayload,
): Promise<BackendBreakpoint> {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/breakpoints/create-new-breakpoints`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({} as any));

  if (!response.ok) {
    const msg =
      typeof data?.message === 'string'
        ? data.message
        : 'Não foi possível criar o breakpoint.';
    throw new Error(msg);
  }

  return (data?.breakpoint ?? data) as BackendBreakpoint;
}

export async function listBreakpointsByPrestador(
  prestadorId: number,
): Promise<BackendBreakpoint[]> {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/breakpoints/view-breakpoints/${prestadorId}`,
    { method: 'GET', headers },
  );

  if (response.status === 404) return [];

  if (!response.ok) {
    throw new Error('Não foi possível carregar os breakpoints.');
  }

  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? (data as BackendBreakpoint[]) : [];
}

export async function updateBreakpoint(
  id: number,
  payload: UpdateBreakpointPayload,
): Promise<BackendBreakpoint> {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/breakpoints/edit-a-breakpoint/${id}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json().catch(() => ({} as any));

  if (!response.ok) {
    const msg =
      typeof data?.message === 'string'
        ? data.message
        : 'Não foi possível atualizar o breakpoint.';
    throw new Error(msg);
  }

  return data as BackendBreakpoint;
}
