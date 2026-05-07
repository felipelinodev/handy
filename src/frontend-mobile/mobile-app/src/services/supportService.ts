import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, getHeaders } from '@/services/apiConfig';

export type SupportCategory =
  | 'cancelamento'
  | 'reclamacao'
  | 'reembolso'
  | 'duvidas-gerais'
  | 'politicas'
  | 'problemas-com-prestador'
  | 'problemas-com-pagamento'
  | 'problemas-tecnicos'
  | 'conta-e-acesso'
  | 'denuncia'
  | 'sugestao';

export interface CreateTicketPayload {
  titulo: string;
  descricao: string;
  categoria: SupportCategory;
}

async function getCurrentUserId(): Promise<number | null> {
  const raw = await AsyncStorage.getItem('@auth_user');
  if (!raw) return null;
  try {
    const u = JSON.parse(raw);
    const id = Number(u?.user_id);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export async function createSupportTicket(payload: CreateTicketPayload) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Você precisa estar logado para abrir um chamado.');

  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/support/create-new-ticket/${userId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      typeof data?.message === 'string'
        ? data.message
        : 'Não foi possível abrir o chamado.';
    throw new Error(msg);
  }

  return data;
}
