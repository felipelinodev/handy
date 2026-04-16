import { Stack } from 'expo-router';
import { 
  useFonts, 
  OpenSans_400Regular, 
  OpenSans_600SemiBold, 
  OpenSans_700Bold 
} from '@expo-google-fonts/open-sans';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ 
    OpenSans_400Regular, 
    OpenSans_600SemiBold, 
    OpenSans_700Bold 
  });

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
    </Stack>
  );
}
