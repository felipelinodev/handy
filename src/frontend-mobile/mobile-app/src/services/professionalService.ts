import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_PORT = 4000;

function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  return `http://192.168.18.180:${API_PORT}`;
}

const BASE_URL = resolveBaseUrl();

export interface BackendProvider {
  user_id: number;
  nome: string;
  email: string;
  photo_url?: string | null;
  endereco?: string | null;
  descricao?: string | null;
  prestador?: {
    media_avaliacao?: number | string | null;
    total_clientes?: number | null;
    servicos?: Array<{
      servico_id: number;
      nome_servico: string;
      descricao?: string | null;
      preco: number | string;
      categoria?: { nome_categoria: string } | null;
    }>;
    prestador_especialidade?: Array<{
      especialidade?: { nome_especialidade: string } | null;
    }>;
  } | null;
}

export interface ProfessionalService {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface ProfessionalListItem {
  id: string;
  name: string;
  rating: number;
  minPrice: number;
  category: string;
  photoUrl: string | null;
  clientsCount: number;
  address: string;
  description: string;
  services: ProfessionalService[];
}

function toMinPrice(servicos?: Array<{ preco: number | string }> | null): number {
  if (!servicos || !Array.isArray(servicos) || servicos.length === 0) return 0;
  const prices = servicos
    .map((s) => Number(s.preco))
    .filter((n) => !Number.isNaN(n) && n > 0);
  return prices.length > 0 ? Math.min(...prices) : 0;
}

function toCategory(p: BackendProvider): string {
  const especialidade = p.prestador?.prestador_especialidade?.[0]?.especialidade?.nome_especialidade;
  if (especialidade) return especialidade;
  const servicoCat = p.prestador?.servicos?.[0]?.categoria?.nome_categoria;
  if (servicoCat) return servicoCat;
  return 'Profissional';
}

export function mapProvider(p: BackendProvider): ProfessionalListItem {
  const services: ProfessionalService[] = (p.prestador?.servicos ?? []).map((s) => ({
    id: s.servico_id,
    name: s.nome_servico,
    description: s.descricao ?? '',
    price: Number(s.preco) || 0,
    category: s.categoria?.nome_categoria ?? '',
  }));

  return {
    id: String(p.user_id),
    name: p.nome,
    rating: Number(p.prestador?.media_avaliacao ?? 0),
    minPrice: toMinPrice(p.prestador?.servicos),
    category: toCategory(p),
    photoUrl: p.photo_url ?? null,
    clientsCount: p.prestador?.total_clientes ?? 0,
    address: p.endereco ?? '',
    description: p.descricao ?? '',
    services,
  };
}

export async function fetchProfessionals(page = 1): Promise<ProfessionalListItem[]> {
  const response = await fetch(`${BASE_URL}/provider/list-service-providers?page=${page}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar os prestadores.');
  }

  const data: BackendProvider[] = await response.json();
  return data.map(mapProvider);
}

export async function fetchProfessionalById(id: number | string): Promise<ProfessionalListItem> {
  const token = await AsyncStorage.getItem('@auth_token');
  const response = await fetch(`${BASE_URL}/provider/view-service-provider/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar este prestador.');
  }

  const data: BackendProvider = await response.json();
  return mapProvider(data);
}

export interface UpdateProviderPayload {
  nome?: string;
  email?: string;
  photo_url?: string | null;
  endereco?: string | null;
  descricao?: string | null;
  especialidades?: number[];
}

export interface Especialidade {
  especialidade_id: number;
  nome_especialidade: string;
}

export interface Categoria {
  categoria_id: number;
  nome_categoria: string;
}

export async function fetchEspecialidades(): Promise<Especialidade[]> {
  const response = await fetch(`${BASE_URL}/provider/especialidades`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Não foi possível carregar especialidades.');
  return await response.json();
}

export async function fetchProviderEspecialidadeIds(id: number | string): Promise<number[]> {
  const token = await AsyncStorage.getItem('@auth_token');
  const response = await fetch(`${BASE_URL}/provider/view-service-provider/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) return [];
  const data: any = await response.json();
  const items = data?.prestador?.prestador_especialidade ?? [];
  return items
    .map((it: any) => it?.especialidade?.especialidade_id ?? it?.especialidade_id)
    .filter((n: any) => typeof n === 'number');
}

export async function fetchCategorias(): Promise<Categoria[]> {
  const token = await AsyncStorage.getItem('@auth_token');
  const url = `${BASE_URL}/category/view-all-category`;
  console.log('[fetchCategorias] GET', url, 'token?', !!token);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  console.log('[fetchCategorias] status', response.status);
  const raw = await response.text();
  console.log('[fetchCategorias] body', raw);

  if (!response.ok) {
    let msg = `Categorias: HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.message === 'string') msg = parsed.message;
    } catch { }
    throw new Error(msg);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.data)) return parsed.data;
  if (Array.isArray(parsed?.categories)) return parsed.categories;
  if (Array.isArray(parsed?.categorias)) return parsed.categorias;
  return [];
}

export interface CreateServicePayload {
  prestador_id: number;
  categoria_id: number;
  nome_servico: string;
  descricao?: string | null;
  preco: number;
}

export async function createService(payload: CreateServicePayload): Promise<void> {
  const token = await AsyncStorage.getItem('@auth_token');
  const response = await fetch(`${BASE_URL}/services/create-new-service`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let msg = 'Não foi possível criar o serviço.';
    try {
      const data = await response.json();
      if (typeof data?.message === 'string') msg = data.message;
    } catch { }
    throw new Error(msg);
  }
}

export interface UpdateServicePayload {
  nome_servico?: string;
  descricao?: string | null;
  preco?: number;
  categoria_id?: number;
}

export async function fetchServiceById(serviceId: number | string): Promise<{
  servico_id: number;
  nome_servico: string;
  descricao: string | null;
  preco: number;
  categoria_id: number;
}> {
  const token = await AsyncStorage.getItem('@auth_token');
  const response = await fetch(`${BASE_URL}/services/list-a-service/${serviceId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error('Não foi possível carregar o serviço.');
  const data = await response.json();
  return {
    servico_id: data.servico_id,
    nome_servico: data.nome_servico,
    descricao: data.descricao ?? null,
    preco: Number(data.preco) || 0,
    categoria_id: data.categoria_id,
  };
}

export async function updateService(serviceId: number | string, payload: UpdateServicePayload): Promise<void> {
  const token = await AsyncStorage.getItem('@auth_token');
  const response = await fetch(`${BASE_URL}/services/edit-a-service/${serviceId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let msg = 'Não foi possível atualizar o serviço.';
    try {
      const data = await response.json();
      if (typeof data?.message === 'string') msg = data.message;
    } catch { }
    throw new Error(msg);
  }
}

export async function updateProfessional(id: number | string, payload: UpdateProviderPayload): Promise<void> {
  const token = await AsyncStorage.getItem('@auth_token');
  const response = await fetch(`${BASE_URL}/provider/update-service-provider/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let msg = 'Não foi possível atualizar o perfil.';
    try {
      const data = await response.json();
      if (typeof data?.message === 'string') msg = data.message;
    } catch { }
    throw new Error(msg);
  }
}
