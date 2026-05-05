import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { getStoredUser, getUserRole } from './userRole';

interface GuardOptions {
  ownerId?: number | string;
  redirectTo?: string;
}

export function useProviderGuard(options: GuardOptions = {}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const user = await getStoredUser();
      const role = getUserRole(user);
      if (role !== 'prestador') {
        if (!cancelled) {
          setAllowed(false);
          Alert.alert(
            'Acesso restrito',
            'Esta área é exclusiva para prestadores.',
            [
              {
                text: 'OK',
                onPress: () => router.replace((options.redirectTo ?? '/home') as any),
              },
            ],
          );
        }
        return;
      }
      if (
        options.ownerId !== undefined &&
        user?.user_id !== undefined &&
        String(user.user_id) !== String(options.ownerId)
      ) {
        if (!cancelled) {
          setAllowed(false);
          Alert.alert(
            'Acesso negado',
            'Você não pode acessar dados de outro prestador.',
            [
              {
                text: 'OK',
                onPress: () => router.replace((options.redirectTo ?? '/home') as any),
              },
            ],
          );
        }
        return;
      }
      if (!cancelled) setAllowed(true);
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [options.ownerId, options.redirectTo, router]);

  return allowed;
}
