import { BASE_URL, getHeaders } from './apiConfig';

export interface Contratacao {
  contratacao_id: number;
  cliente_id: number;
  prestador_id: number;
  servico_id: number;
  titulo: string;
  detalhes: string | null;
  endereco: string | null;
  status: string;
  inicio: string | null;
  conclusao: string | null;
  vencimento: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchContrato(id: number): Promise<Contratacao> {
  const headers = await getHeaders();

  const response = await fetch(`${BASE_URL}/contratations/view-a-contract/${id}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao carregar o contrato.');
  }

  return data as Contratacao;
}

export async function fetchAllContracts(): Promise<Contratacao[]> {
  const headers = await getHeaders();

  const response = await fetch(`${BASE_URL}/contratations/view-all-contracts`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar os contratos.');
  }

  return (await response.json()) as Contratacao[];
}

export async function fetchClientContracts(clienteId: number): Promise<Contratacao[]> {
  const all = await fetchAllContracts();
  return all.filter((c) => c.cliente_id === clienteId);
}

export async function fetchPrestadorContracts(prestadorId: number): Promise<Contratacao[]> {
  const all = await fetchAllContracts();
  return all.filter((c) => c.prestador_id === prestadorId);
}

const STATUS_CONCLUIDO = ['concluido', 'concluído', 'finalizado', 'concluída'];

/**
 * Busca todos os contratos e retorna apenas os do cliente logado
 * com status concluído (sem avaliação registrada ainda).
 */
export async function fetchConcludedContracts(clienteId: number): Promise<Contratacao[]> {
  const headers = await getHeaders();

  const response = await fetch(`${BASE_URL}/contratations/view-all-contracts`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) return [];

  const data: Contratacao[] = await response.json();

  return data.filter((c: any) => {
    const matchUser = Number(c.cliente_id) === Number(clienteId);
    
    // Normaliza o status (remove acentos e espaços) para comparação segura
    const statusLimpo = (c.status ?? '')
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
      
    const statusValidos = ['concluida', 'concluido', 'finalizado'];
    const isConcluido = statusValidos.includes(statusLimpo);
    
    const jaAvaliado = !!c.avaliacao;

    console.log(`[CHECKER] Contrato ${c.contratacao_id}: ClienteID=${c.cliente_id} (Match=${matchUser}), Status='${c.status}' (Match=${isConcluido}), JáAvaliado=${jaAvaliado}`);

    return matchUser && isConcluido && !jaAvaliado;
  });
}

export interface CreateContratationPayload {
  cliente_id: number;
  prestador_id: number;
  servico_id: number;
  titulo: string;
  detalhes?: string;
  endereco?: string;
  inicio?: string;
  conclusao?: string;
  vencimento?: string;
}

export async function createContract(
  payload: CreateContratationPayload,
): Promise<Contratacao> {
  const headers = await getHeaders();

  const response = await fetch(`${BASE_URL}/contratations/create-a-contratation`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      typeof data?.message === 'string'
        ? data.message
        : 'Não foi possível criar o contrato.';
    throw new Error(msg);
  }

  return (data?.data ?? data) as Contratacao;
}

export async function fetchProviderContracts(prestadorId: number): Promise<Contratacao[]> {
  const all = await fetchAllContracts();
  return all.filter((c) => c.prestador_id === prestadorId);
}

export async function updateContractStatus(
  id: number,
  status: string,
): Promise<Contratacao> {
  const headers = await getHeaders();

  const response = await fetch(`${BASE_URL}/contratations/update/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      typeof data?.message === 'string'
        ? data.message
        : 'Erro ao atualizar o contrato.';
    throw new Error(msg);
  }

  return (data?.contratation ?? data) as Contratacao;
}
