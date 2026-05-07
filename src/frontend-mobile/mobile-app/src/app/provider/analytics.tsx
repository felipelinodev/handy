import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/theme/colors';
import { ProviderBottomNavBar } from '@/features/provider/components/ProviderBottomNavBar';

export default function ProviderAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Ionicons name="construct-outline" size={56} color={colors.primary} />
        <Text style={styles.title}>Em manutenção</Text>
        <Text style={styles.subtitle}>
          Estamos preparando suas métricas. Em breve estará disponível!
        </Text>
      </View>
      <ProviderBottomNavBar activeTab="analytics" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.muttedSurface,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
