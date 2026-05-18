import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Icon from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/theme/colors';
import { Fonts } from '@/theme/fonts';
import { BottomNavBar } from '@/shared/components/BottomNavBar';
import { HandyIcon } from '@/shared/components/HandyIcon';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import {
  fetchProfessionals,
  ProfessionalListItem,
} from '@/features/professionals/services/professionalService';

const PROFILE_PLACEHOLDER = require('../../../../assets/images/fundo_neutro.png');

export default function SearchProvidersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [professionals, setProfessionals] = useState<ProfessionalListItem[]>([]);
  const [filteredList, setFilteredList] = useState<ProfessionalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProfessionals = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const list = await fetchProfessionals();
      setProfessionals(list);
      setFilteredList(list);
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Erro ao carregar prestadores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfessionals();
  }, [loadProfessionals]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredList(professionals);
      return;
    }
    const filtered = professionals.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(query);
      const categoryMatch = p.category.toLowerCase().includes(query);
      const addressMatch = p.address?.toLowerCase().includes(query) ?? false;
      const serviceMatch = p.services.some(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query),
      );
      return nameMatch || categoryMatch || serviceMatch || addressMatch;
    });
    setFilteredList(filtered);
  }, [searchQuery, professionals]);

  function handleOpenProfile(professionalId: string) {
    router.push(`/professional/${professionalId}` as any);
  }

  return (
    <ImageBackground
      source={require('../../../../assets/images/fundo_neutro_clean.png')}
      style={styles.screenBg}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Icon name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Buscar Prestadores</Text>
        <NotificationBell />
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Icon name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, serviço, local..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
              <Icon name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : errorMsg ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity onPress={loadProfessionals}>
            <Text style={styles.retryLink}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : filteredList.length === 0 ? (
        <View style={styles.centered}>
          <Icon name="search-outline" size={36} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum prestador disponível'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'Tente buscar por outro nome, serviço ou localização.'
              : 'Novos prestadores aparecerão aqui.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {!!searchQuery && (
            <Text style={styles.resultCount}>
              {filteredList.length} resultado{filteredList.length !== 1 ? 's' : ''}
            </Text>
          )}
          {filteredList.map((professional) => (
            <TouchableOpacity
              key={professional.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleOpenProfile(professional.id)}>
              <Image
                source={
                  professional.photoUrl
                    ? { uri: professional.photoUrl }
                    : PROFILE_PLACEHOLDER
                }
                style={styles.avatar}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
              <View style={styles.cardContent}>
                <View style={styles.cardLeftColumn}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {professional.name}
                  </Text>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{professional.category}</Text>
                  </View>
                </View>

                <View style={styles.cardRightColumn}>
                  <View style={styles.ratingRow}>
                    <HandyIcon name="solar:star-bold" size={14} color={colors.primary} />
                    <Text style={styles.ratingText}>
                      {Number(professional.rating).toFixed(1).replace('.', ',')}
                    </Text>
                  </View>
                  <View style={styles.clientsRow}>
                    <HandyIcon name="hugeicons:user-group" size={16} color={colors.navInactive} />
                    <Text style={styles.clientsText}>
                      {professional.clientsCount} Clientes
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <BottomNavBar activeTab="search" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screenBg: {
    flex: 1,
    backgroundColor: colors.muttedSurface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  screenTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.textDark,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.textDark,
    padding: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 140,
    gap: 12,
  },
  resultCount: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.textMuted,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 14,
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeftColumn: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  cardRightColumn: {
    alignItems: 'flex-end',
    gap: 8,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.textSecondary,
  },
  categoryPill: {
    backgroundColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  categoryPillText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  clientsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientsText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: colors.navInactive,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: colors.textDark,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.error,
    textAlign: 'center',
  },
  retryLink: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
