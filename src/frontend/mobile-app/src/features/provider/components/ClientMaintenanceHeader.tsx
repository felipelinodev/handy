import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

import colors from '@/theme/colors';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { FILTER_OPTIONS, FilterOption } from '@/features/provider/data/mockMaintenance';

interface ProviderInfo {
  nome: string;
  especialidade: string;
  rating: number;
  photo_url?: string;
  clientsCount?: number;
}

interface ClientMaintenanceHeaderProps {
  titulo: string;
  subtitulo?: string;
  contratoId?: string;
  provider: ProviderInfo | null;
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  onPrevContract?: () => void;
  onNextContract?: () => void;
}

export const ClientMaintenanceHeader: React.FC<ClientMaintenanceHeaderProps> = ({
  titulo,
  subtitulo,
  contratoId,
  provider,
  activeFilter,
  onFilterChange,
  onPrevContract,
  onNextContract,
}) => {
  const router = useRouter();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  function handleVerContrato() {
    if (contratoId) {
      router.push({
        pathname: '/contratations/[id]' as any,
        params: { id: contratoId },
      });
    }
  }

  function handleSelectFilter(filter: FilterOption) {
    onFilterChange(filter);
    setShowFilterDropdown(false);
  }

  return (
    <View style={styles.container}>
      {/* Linha superior: Voltar + Notificação */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Icon name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <NotificationBell />
      </View>

      {/* Card do Prestador */}
      {provider && (
        <View style={styles.providerCard}>
          <Image
            source={
              provider.photo_url
                ? { uri: provider.photo_url }
                : require('../../../../assets/images/fundo_neutro.png')
            }
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{provider.nome}</Text>
            <View style={styles.specialtyPill}>
              <Text style={styles.specialtyPillText}>{provider.especialidade}</Text>
            </View>
          </View>
          <View style={styles.providerMeta}>
            <View style={styles.ratingRow}>
              <Icon name="star" size={13} color={colors.primary} />
              <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
            </View>
            <View style={styles.clientsRow}>
              <Icon name="people-outline" size={13} color={colors.textDark} />
              <Text style={styles.clientsText}>
                {provider.clientsCount ?? 0} Clientes
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Slider de Contratos: < Nome do Contrato > */}
      <View style={styles.sliderRow}>
        <TouchableOpacity
          style={styles.sliderArrow}
          onPress={onPrevContract}
          activeOpacity={0.7}>
          <Icon name="chevron-back" size={18} color={colors.textDark} />
        </TouchableOpacity>

        <Text style={styles.sliderTitle} numberOfLines={1}>{titulo}</Text>

        <TouchableOpacity
          style={styles.sliderArrow}
          onPress={onNextContract}
          activeOpacity={0.7}>
          <Icon name="chevron-forward" size={18} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      {/* Título + Subtítulo */}
      <View style={styles.titleBlock}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.subtitulo}>{subtitulo ?? 'Acomanhamento do Projeto'}</Text>
      </View>

      {/* Ações: Ver contrato + Filtro */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.contractPill}
          activeOpacity={0.7}
          onPress={handleVerContrato}>
          <MaterialCommunityIcons name="text-box-outline" size={20} color={colors.textDark} />
          <Text style={styles.contractPillText}>Ver contrato</Text>
        </TouchableOpacity>

        <View>
          <TouchableOpacity
            style={styles.filterPill}
            activeOpacity={0.7}
            onPress={() => setShowFilterDropdown(true)}>
            <Text style={styles.filterPillText}>{activeFilter}</Text>
            <MaterialCommunityIcons name="filter-variant" size={24} color={colors.textDark} />
          </TouchableOpacity>

          <Modal
            visible={showFilterDropdown}
            transparent
            animationType="fade"
            onRequestClose={() => setShowFilterDropdown(false)}>
            <Pressable
              style={styles.dropdownBackdrop}
              onPress={() => setShowFilterDropdown(false)}>
              <View style={styles.dropdownContainer}>
                {FILTER_OPTIONS.map((option) => {
                  const isActive = option === activeFilter;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownItem,
                        isActive && styles.dropdownItemActive,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleSelectFilter(option)}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isActive && styles.dropdownItemTextActive,
                        ]}>
                        {option}
                      </Text>
                      {isActive && (
                        <Icon name="checkmark" size={16} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Pressable>
          </Modal>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 12,

  },
  /* ── Linha superior ── */
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  /* ── Card do Prestador ── */
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#E0D5F0',
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
    gap: 6,
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: '#695095',
  },
  specialtyPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0D5F0',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 50,
  },
  specialtyPillText: {
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#695095',
  },
  providerMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
  },
  clientsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clientsText: {
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
  },
  /* ── Slider de Contratos ── */
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    width: 230,
    borderRadius: 100,
    padding: 7,
    gap: 10,
  },
  sliderArrow: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderTitle: {
    fontSize: 14,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
    textAlign: 'center',
  },
  /* ── Título + Subtítulo ── */
  titleBlock: {
    marginBottom: 14,
  },
  titulo: {
    fontSize: 22,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginBottom: 2,
  },
  subtitulo: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  /* ── Ações: Ver contrato + Filtro ── */
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contractPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E0D7FF',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 50,
  },
  contractPillText: {
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
    textDecorationLine: 'underline',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#CBC3F8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
  },
  filterPillText: {
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
    color: '#695095',
  },
  /* ── Dropdown ── */
  dropdownBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 19, 65, 0.3)',
  },
  dropdownContainer: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 8,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  dropdownItemActive: {
    backgroundColor: colors.muttedSurface,
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
  },
  dropdownItemTextActive: {
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
  },
});
