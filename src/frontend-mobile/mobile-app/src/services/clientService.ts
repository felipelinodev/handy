import { BASE_URL, getHeaders } from './apiConfig';

export interface ClientInfo {
  user_id: number;
  nome: string;
  email?: string;
  photo_url?: string | null;
}

export async function fetchClientById(id: number): Promise<ClientInfo | null> {
  try {
    const headers = await getHeaders();
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
