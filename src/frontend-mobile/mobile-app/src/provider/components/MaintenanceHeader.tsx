import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import colors from '../../utils/colors';
import { NotificationBell } from '../../components/NotificationBell';
import { FILTER_OPTIONS, FilterOption } from '../data/mockMaintenance';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface MaintenanceHeaderProps {
  titulo: string;
  subtitulo: string;
  contratoId: string;
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export const MaintenanceHeader: React.FC<MaintenanceHeaderProps> = ({
  titulo,
  subtitulo,
  contratoId,
  activeFilter,
  onFilterChange,
}) => {
  const router = useRouter();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  function handleVerContrato() {
    router.push({
      pathname: '/contratations/[id]' as any,
      params: { id: contratoId },
    });
  }

  function handleSelectFilter(filter: FilterOption) {
    onFilterChange(filter);
    setShowFilterDropdown(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Icon name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <NotificationBell />
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.subtitulo}>{subtitulo}</Text>
      </View>

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
                        <Icon
                          name="checkmark"
                          size={16}
                          color={colors.primary}
                        />
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
