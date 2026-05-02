import React, { useState } from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Icon from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '../../utils/colors';
import { BottomNavBar } from '../../components/BottomNavBar';
import { HandyIcon } from '@/components/HandyIcon';

const PROFILE_PLACEHOLDER = require('../../assets/fundo_neutro.png');
const DESCRIPTION_PREVIEW_LIMIT = 220;

type Params = {
  id?: string;
  servicoId?: string;
  prestadorId?: string;
  servicoNome?: string;
  servicoDescricao?: string;
  preco?: string;
  prestadorNome?: string;
  prestadorFoto?: string;
  prestadorCategoria?: string;
  prestadorRating?: string;
  prestadorClientes?: string;
  modo?: 'presencial' | 'digital';
  data?: string;
  hora?: string;
  endereco?: string;
  observacoes?: string;
  status?: string;
};

const STATUS_LABEL: Record<string, string> = {
  Pendente: 'Pendente',
  Aceita: 'Aceita',
  Em_Andamento: 'Em Andamento',
  Concluida: 'Concluída',
  Concluída: 'Concluída',
  Cancelada: 'Cancelada',
};

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Pendente: { bg: '#FFF1C2', fg: '#A06A00' },
  Aceita: { bg: '#D6E4FF', fg: '#1E40AF' },
  Em_Andamento: { bg: '#E0DDF7', fg: colors.primary },
  Concluida: { bg: '#D1FAE5', fg: '#065F46' },
  Concluída: { bg: '#D1FAE5', fg: '#065F46' },
  Cancelada: { bg: '#FEE2E2', fg: '#B91C1C' },
};

function localFromParams(p: Params): string {
  if (p.modo === 'digital') return 'Plataforma';
  if (p.endereco && p.endereco.trim().length > 0) {
    const first = p.endereco.split(',')[0]?.trim();
    return first && first.length > 0 ? first : p.endereco;
  }
  return '—';
}

function prazoFromParams(p: Params): string {
  if (p.data && p.data.length === 10) return p.data;
  return '—';
}

export default function ContractDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();
  const [showFullDescription, setShowFullDescription] = useState(false);

  const status = params.status ?? 'Pendente';
  const statusLabel = STATUS_LABEL[status] ?? status;
  const statusStyle =
    STATUS_STYLES[status] ?? { bg: colors.muttedSurface, fg: colors.textDark };

  const precoNum = Number(params.preco ?? 0) || 0;
  const precoLabel = `R$ ${precoNum.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const description = params.servicoDescricao?.trim() ?? '';
  const isLongDescription = description.length > DESCRIPTION_PREVIEW_LIMIT;
  const visibleDescription =
    !isLongDescription || showFullDescription
      ? description
      : `${description.slice(0, DESCRIPTION_PREVIEW_LIMIT).trim()}…`;

  const observacoesLines = (params.observacoes ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  function handleViewContract() {
    router.push({
      pathname: '/contratations/accep-contract',
      params: {
        servicoId: params.servicoId ?? '',
        prestadorId: params.prestadorId ?? '',
        servicoNome: params.servicoNome ?? '',
        servicoDescricao: params.servicoDescricao ?? '',
        preco: params.preco ?? '0',
        prestadorNome: params.prestadorNome ?? '',
        modo: params.modo ?? 'presencial',
        data: params.data ?? '',
        hora: params.hora ?? '',
        endereco: params.endereco ?? '',
        observacoes: params.observacoes ?? '',
        readonly: '1',
      },
    });
  }

  return (
    <ImageBackground
      source={require('../../assets/fundo_neutro_clean.png')}
      style={styles.background}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8, paddingBottom: 140 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => router.back()}>
            <Icon name="chevron-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Icon name="notifications-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.providerCard}>
          <Image
            source={
              params.prestadorFoto
                ? { uri: params.prestadorFoto }
                : PROFILE_PLACEHOLDER
            }
            style={styles.avatar}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName} numberOfLines={1}>
              {params.prestadorNome ?? '—'}
            </Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>
                {params.prestadorCategoria ?? 'Profissional'}
              </Text>
            </View>
          </View>
          <View style={styles.providerMeta}>
            <View style={styles.ratingBox}>
              <Icon name="star" size={13} color="#FFB800" />
              <Text style={styles.ratingText}>
                {Number(params.prestadorRating ?? 0).toFixed(1)}
              </Text>
            </View>
            <View style={styles.clientsBox}>
              <Icon name="people-outline" size={13} color={colors.textDark} />
              <Text style={styles.clientsText}>
                {params.prestadorClientes ?? '0'} Clientes
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.serviceCard}>
          <View style={styles.generalHeader}>

            <View style={styles.serviceHeader}>
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={8}
                onPress={handleViewContract}
                style={styles.docIconButton}>
                <Icon name="document-text-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.serviceTitle} numberOfLines={2}>
                {params.servicoNome ?? '—'}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>
                  Valor: <Text style={styles.metaValuePrimary}>{precoLabel}</Text>
                </Text>
                <Text style={styles.metaLabel}>
                  Local:{' '}
                  <Text style={styles.metaValueDark}>{localFromParams(params)}</Text>
                </Text>
              </View>
              <View style={styles.metaCellRight}>
                <Text style={styles.metaLabel}>
                  Prazo:{' '}
                  <Text style={styles.metaValueDark}>{prazoFromParams(params)}</Text>
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: statusStyle.bg },
                  ]}>
                  <Text style={[styles.statusPillText, { color: statusStyle.fg }]}>
                    {statusLabel}
                  </Text>
                </View>
              </View>
            </View>

          </View>

          <Text style={styles.sectionTitle}>Detalhes</Text>
          <View style={styles.detailsBox}>
            <Text style={styles.detailsText}>
              {description.length > 0 ? visibleDescription : 'Sem descrição.'}
              {isLongDescription && (
                <Text
                  style={styles.detailsLink}
                  onPress={() => setShowFullDescription((v) => !v)}>
                  {' '}
                  {showFullDescription ? 'Ver menos.' : 'Ler mais.'}
                </Text>
              )}
            </Text>
          </View>

          {observacoesLines.length > 0 && (
            <>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.bulletIcon}>
                  <Icon name="checkmark" size={12} color={colors.textWhite} />
                </View>
                <Text style={styles.sectionTitleInline}>Entregáveis.</Text>
              </View>
              <View style={styles.bulletList}>
                {observacoesLines.map((line, idx) => (
                  <Text key={idx} style={styles.bulletItem}>
                    {'•  '}
                    {line}
                  </Text>
                ))}
              </View>
            </>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.outlineButton}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/contratations/cancel-contract',
                  params: { id: params.id ?? '' },
                })
              }>
              <Text style={{ color: colors.buttonDark }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fullButton}
              activeOpacity={0.85}>
              <HandyIcon name="carbon:chat" size={20} color={colors.primary} />
              <Text style={{ color: colors.buttonDark }}>Ver mensagens</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar activeTab="history" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.muttedSurface,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginBottom: 16,
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
  providerInfo: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 6,
  },
  providerName: {
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
  providerMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
  },
  clientsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clientsText: {
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 9,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  generalHeader: {
    backgroundColor: '#eae6f8ff',
    padding: 10,
    borderRadius: 10
  },
  serviceHeader: {
    flexDirection: 'row',

    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  docIconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  metaRow: {

    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  metaCell: {

    gap: 4,
  },
  metaCellRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
  },
  metaValuePrimary: {
    fontSize: 13,
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
  },
  metaValueDark: {
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: 'OpenSans_700Bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitleInline: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  bulletIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.textDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBox: {
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  detailsText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
  },
  detailsLink: {
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  bulletList: {
    gap: 4,
    paddingLeft: 4,
  },
  bulletItem: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 11,
    marginTop: 18,

  },
  outlineButton: {
    width: '48%',
    flexDirection: 'row',
    height: 40,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#BFBADE',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
  },
  fullButton: {
    width: '48%',
    flexDirection: 'row',
    height: 40,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: "#DCD5FE"
  },
});
