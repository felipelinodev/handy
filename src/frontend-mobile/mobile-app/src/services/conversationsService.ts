import { BASE_URL, getHeaders } from '@/services/apiConfig';

export interface PrestadorConversation {
  conversa_id: number;
  contratacao_id: number;
  cliente_id: number;
  cliente_nome: string | null;
  cliente_photo_url: string | null;
  contratacao_titulo: string | null;
  contratacao_status: string | null;
  ultima_mensagem_id: number | null;
  ultima_mensagem_conteudo: string | null;
  ultima_mensagem_at: string | null;
  status: string | null;
}

export async function listConversationsByPrestador(
  prestadorId: number,
): Promise<PrestadorConversation[]> {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/conversations/list-by-prestador/${prestadorId}`,
    { method: 'GET', headers },
  );

  if (!response.ok) {
    throw new Error('Não foi possível carregar as conversas.');
  }

  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? (data as PrestadorConversation[]) : [];
}

export interface EnsuredThread {
  conversa_id: number;
  contratacao_id: number;
  cliente_id: number;
  prestador_id: number;
  mensagem_id: number;
  created: boolean;
}

export async function ensureThreadByContratacao(
  contratacaoId: number,
): Promise<EnsuredThread> {
  const headers = await getHeaders();
  const url = `${BASE_URL}/conversations/ensure-by-contratacao/${contratacaoId}`;

  console.log('[ensureThread] POST', url);

  const response = await fetch(url, { method: 'POST', headers });

  const text = await response.text().catch(() => '');
  console.log('[ensureThread] status:', response.status, 'body:', text);

  if (!response.ok) {
    let msg = `Erro ${response.status}`;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed?.message === 'string') msg = parsed.message;
    } catch {}
    throw new Error(msg);
  }

  try {
    return JSON.parse(text) as EnsuredThread;
  } catch {
    throw new Error('Resposta inválida do servidor.');
  }
}
