import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProviderProfileData } from '../types/provider.types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.137.58:4001';

export async function fetchProviderProfile(id: number | string): Promise<any> {
  const token = await AsyncStorage.getItem('@auth_token');
  
  const response = await fetch(`${BASE_URL}/provider/view-service-provider/${id}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao carregar dados do provedor.');
  }

  return data;
}

export async function fetchProviderServices(providerId: number | string): Promise<any> {
    const token = await AsyncStorage.getItem('@auth_token');
    
    const response = await fetch(`${BASE_URL}/services/provider/${providerId}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}` 
      },
    });
  
    if(!response.ok) return [];
    const data = await response.json();
    return data;
}
