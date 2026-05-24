import { ProviderProfileData } from '@/features/provider/types';
import { BASE_URL, getHeaders } from '@/services/apiConfig';

export async function fetchProviderProfile(id: number | string): Promise<any> {
  const headers = await getHeaders();
  
  const response = await fetch(`${BASE_URL}/provider/view-service-provider/${id}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao carregar dados do provedor.');
  }

  return data;
}

export async function fetchProviderServices(providerId: number | string): Promise<any> {
    const headers = await getHeaders();
    
    const response = await fetch(`${BASE_URL}/services/provider/${providerId}`, {
      method: 'GET',
      headers,
    });
  
    if(!response.ok) return [];
    const data = await response.json();
    return data;
}
