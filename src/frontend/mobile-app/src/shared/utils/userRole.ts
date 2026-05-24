import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'cliente' | 'prestador' | null;

export interface StoredUser {
  user_id?: number;
  nome?: string;
  email?: string;
  tipo_usuario?: string;
  [key: string]: any;
}

export async function getStoredUser(): Promise<StoredUser | null> {
  try {
    const raw = await AsyncStorage.getItem('@auth_user');
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function getUserRole(user: StoredUser | null): UserRole {
  if (!user) return null;
  const tipo = String(user.tipo_usuario ?? '').toLowerCase();
  if (tipo === 'prestador') return 'prestador';
  if (tipo === 'cliente') return 'cliente';
  return null;
}

export async function isProviderLoggedIn(): Promise<boolean> {
  const user = await getStoredUser();
  return getUserRole(user) === 'prestador';
}
