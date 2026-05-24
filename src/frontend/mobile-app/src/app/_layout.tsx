import { useEffect } from 'react';
import { AppState } from 'react-native';
import {
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
  useFonts,
} from '@expo-google-fonts/open-sans';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import colors from '@/theme/colors';
import {
  clearLegacyGlobalNotifications,
  performClientNotificationSync,
} from '@/features/notifications/services/notificationService';
import { InAppNotificationToaster } from '@/features/notifications/components/InAppNotificationToaster';

const NOTIFICATION_POLL_MS = 20000;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    function runOnce() {
      if (cancelled) return;
      performClientNotificationSync();
    }

    clearLegacyGlobalNotifications().finally(runOnce);
    interval = setInterval(runOnce, NOTIFICATION_POLL_MS);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') runOnce();
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      sub.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.muttedSurface },
        }}
      />
      <InAppNotificationToaster />
    </SafeAreaProvider>
  );
}
