import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

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
