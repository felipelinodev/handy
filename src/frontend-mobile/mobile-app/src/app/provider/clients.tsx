import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/theme/colors';
import { ProviderBottomNavBar } from '@/features/provider/components/ProviderBottomNavBar';

export default function ProviderClientsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Ionicons name="people-outline" size={56} color={colors.primary} />
        <Text style={styles.title}>Meus Clientes</Text>
        <Text style={styles.subtitle}>
          Aqui você poderá visualizar e gerenciar sua base de clientes. Em breve!
        </Text>
      </View>
      <ProviderBottomNavBar activeTab="clients" />
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
