import { BASE_URL, getHeaders } from '@/services/apiConfig';

export interface Category {
  categoria_id: number;
  nome_categoria: string;
  rank_categoria: number | null;
  icon_tag: string | null;
}

/**
 * Busca todas as categorias da API.
 */
export async function fetchCategories(): Promise<Category[]> {
  const headers = await getHeaders();
  const response = await fetch(`${BASE_URL}/category/view-all-category`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar as categorias.');
  }

  const raw = await response.text();

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (Array.isArray(parsed)) return filterAndSort(parsed);
  if (Array.isArray(parsed?.data)) return filterAndSort(parsed.data);
  return [];
}

/**
 * Filtra categorias com rank > 0, ordena por rank e retorna apenas as 8 primeiras.
 */
function filterAndSort(list: Category[]): Category[] {
  return list
    .filter(c => c.rank_categoria != null && c.rank_categoria > 0)
    .sort((a, b) => (a.rank_categoria ?? 0) - (b.rank_categoria ?? 0))
    .slice(0, 8);
}
