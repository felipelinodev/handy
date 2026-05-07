import { Stack } from 'expo-router';

export default function ProviderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="analytics" />
      <Stack.Screen name="clients" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="menu" />
    </Stack>
  );
}
