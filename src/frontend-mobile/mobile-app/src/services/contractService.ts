import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_PORT = 4000;

function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  return `http://192.168.18.180:${API_PORT}`;
}

const BASE_URL = resolveBaseUrl();

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
  const token = await AsyncStorage.getItem('@auth_token');

  const response = await fetch(`${BASE_URL}/contratations/view-a-contract/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao carregar o contrato.');
  }

  return data as Contratacao;
}

export async function fetchAllContracts(): Promise<Contratacao[]> {
  const token = await AsyncStorage.getItem('@auth_token');

  const response = await fetch(`${BASE_URL}/contratations/view-all-contracts`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
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

const STATUS_CONCLUIDO = ['concluido', 'concluído', 'finalizado'];

/**
 * Busca todos os contratos e retorna apenas os do cliente logado
 * com status concluído (sem avaliação registrada ainda).
 */
export async function fetchConcludedContracts(clienteId: number): Promise<Contratacao[]> {
  const token = await AsyncStorage.getItem('@auth_token');

  const response = await fetch(`${BASE_URL}/contratations/view-all-contracts`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return [];

  const data: Contratacao[] = await response.json();

  return data.filter(
    (c) =>
      c.cliente_id === clienteId &&
      STATUS_CONCLUIDO.includes((c.status ?? '').toLowerCase().trim()),
  );
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
  const token = await AsyncStorage.getItem('@auth_token');

  const response = await fetch(`${BASE_URL}/contratations/create-a-contratation`, {
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
        : 'Não foi possível criar o contrato.';
    throw new Error(msg);
  }

  return (data?.data ?? data) as Contratacao;
}
