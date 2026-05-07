import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/shared/utils/colors';

export default function ServiceCard({ service }: { service: any }) {
  const precoFormatado = service.preco ? `R$ ${Number(service.preco).toFixed(2)}` : 'Consulte';
  const title = service.nome_servico || service.title;
  const description = service.descricao || service.description;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.priceLabel}>Valor mínimo <Text style={styles.priceValue}>{precoFormatado}</Text></Text>
      </View>
      
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.footerRow}>
        <TouchableOpacity>
          <Text style={styles.knowMore}>Saber mais</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="hand-right-outline" size={20} color={colors.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 16,
    color: colors.textDark,
    flex: 1,
  },
  priceLabel: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  priceValue: {
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
    fontSize: 14,
  },
  description: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    color: colors.textDark,
    lineHeight: 22,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  knowMore: {
    fontFamily: 'OpenSans_400Regular',
    color: colors.primary,
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: colors.primaryLight,
    padding: 10,
    borderRadius: 12,
  }
});
