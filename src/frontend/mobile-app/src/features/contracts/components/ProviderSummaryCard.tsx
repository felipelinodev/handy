import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Icon from '@expo/vector-icons/Ionicons';

import colors from '@/theme/colors';

const PROFILE_PLACEHOLDER = require('../../../../assets/images/fundo_neutro.png');

type Props = {
  nome?: string;
  foto?: string;
  categoria?: string;
  rating?: string;
  clientes?: string;
};

export function ProviderSummaryCard({
  nome,
  foto,
  categoria,
  rating,
  clientes,
}: Props) {
  return (
    <View style={styles.card}>
      <Image
        source={foto ? { uri: foto } : PROFILE_PLACEHOLDER}
        style={styles.avatar}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {nome ?? '—'}
        </Text>
        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>{categoria ?? 'Profissional'}</Text>
        </View>
      </View>
      <View style={styles.meta}>
        <View style={styles.row}>
          <Icon name="star" size={13} color="#FFB800" />
          <Text style={styles.ratingText}>
            {Number(rating ?? 0).toFixed(1)}
          </Text>
        </View>
        <View style={styles.row}>
          <Icon name="people-outline" size={13} color={colors.textDark} />
          <Text style={styles.clientsText}>{clientes ?? '0'} Clientes</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#E0D5F0',
  },
  info: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#CBC3F8',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 50,
  },
  rolePillText: {
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.primary,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
  },
  clientsText: {
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
  },
});
