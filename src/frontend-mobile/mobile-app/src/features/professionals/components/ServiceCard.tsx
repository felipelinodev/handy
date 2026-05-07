import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

import colors from '@/shared/utils/colors';
import { ProfessionalService } from '@/features/professionals/services/professionalService';
import { HandyIcon } from '@/shared/components/HandyIcon';

interface ServiceCardProps {
  service: ProfessionalService;
  onPressDetails?: () => void;
  onPressHire?: () => void;
  onPressEdit?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onPressDetails,
  onPressHire,
  onPressEdit,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {service.name}
        </Text>
        <View style={styles.headerRight}>
          <Text style={styles.priceLabel}>
            Valor mínimo{' '}
            <Text style={styles.priceValue}>
              R$ {service.price.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </Text>
          {onPressEdit && (
            <TouchableOpacity
              onPress={onPressEdit}
              activeOpacity={0.7}
              hitSlop={10}
              style={styles.editButton}>
              <Icon name="create-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!!service.description && (
        <View style={styles.body}>
          <Text style={styles.description} numberOfLines={3}>
            {service.description}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.7} onPress={onPressDetails}>
          <Text style={styles.link}>Saber mais.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={onPressHire}>
          <HandyIcon name="hugeicons:agreement-02" size={22} color={colors.textWhite} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F0E6FF',
    gap: 10,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
  },
  priceValue: {
    fontSize: 13,
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
  },
  body: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  link: {
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  cta: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
