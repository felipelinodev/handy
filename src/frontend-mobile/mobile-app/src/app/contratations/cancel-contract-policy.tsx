import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { NotificationBell } from '../../components/NotificationBell';
import { fetchContrato, updateContractStatus } from '../../services/contractService';
import { createSupportTicket } from '../../services/supportService';

const PROFILE_PLACEHOLDER = require('../../assets/fundo_neutro.png');
const FREE_CANCEL_WINDOW_MS = 5 * 60 * 1000;
const CLOCK_SKEW_TOLERANCE_MS = 60 * 1000;

function parseServerDate(raw: string | null | undefined): number | null {
  if (!raw) return null;
  let t = new Date(raw).getTime();
  if (Number.isFinite(t)) return t;
  // Fallback: server may have sent "YYYY-MM-DD HH:mm:ss" without timezone info.
  // Force UTC interpretation by replacing space with 'T' and appending 'Z'.
  if (typeof raw === 'string') {
    const normalized = raw.replace(' ', 'T');
    const withZ = /[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized) ? normalized : normalized + 'Z';
    t = new Date(withZ).getTime();
    if (Number.isFinite(t)) return t;
  }
  return null;
}

function isWithinFreeWindow(createdAtRaw: string | null | undefined): boolean {
  const createdAt = parseServerDate(createdAtRaw);
  if (createdAt == null) return false;
  const elapsed = Date.now() - createdAt;
  // Tolerate small clock skew between client and server in both directions.
  return (
    elapsed >= -CLOCK_SKEW_TOLERANCE_MS &&
    elapsed <= FREE_CANCEL_WINDOW_MS + CLOCK_SKEW_TOLERANCE_MS
  );
}

type Params = {
  contratoId?: string;
  motivo?: string;
  detalhes?: string;
  prestadorNome?: string;
  prestadorFoto?: string;
  prestadorCategoria?: string;
  prestadorRating?: string;
  prestadorClientes?: string;
};

export default function CancelContractPolicyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();

  const [submitting, setSubmitting] = useState(false);

  async function handleProceed() {
    const idStr = params.contratoId;
    const id = Number(idStr);
    if (!idStr || !Number.isFinite(id) || id <= 0) {
      Alert.alert('Erro', 'Contrato inválido.');
      return;
    }
    const motivo = (params.motivo ?? '').trim();
    if (!motivo) {
      Alert.alert('Erro', 'O motivo do cancelamento não foi informado.');
      return;
    }

    setSubmitting(true);
    try {
      const contrato = await fetchContrato(id);

      const status = (contrato.status ?? '').toLowerCase();
      if (status.startsWith('conclu')) {
        Alert.alert(
          'Não permitido',
          'Este contrato já foi concluído e não pode ser cancelado.',
        );
        return;
      }
      if (status === 'cancelada') {
        Alert.alert('Não permitido', 'Este contrato já foi cancelado.');
        return;
      }

      const withinFreeWindow = isWithinFreeWindow(contrato.created_at);

      if (withinFreeWindow) {
        await updateContractStatus(id, 'Cancelada');
        Alert.alert(
          'Contrato cancelado',
          'Seu cancelamento foi processado sem custos.',
          [{ text: 'OK', onPress: () => router.replace('/contratations' as any) }],
        );
        return;
      }

      const detalhes = (params.detalhes ?? '').trim();
      const descricao = [
        `Contrato #${id}`,
        `Motivo: ${motivo}`,
        detalhes ? `Detalhes: ${detalhes}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      await createSupportTicket({
        titulo: `Cancelamento do contrato #${id}`,
        descricao,
        categoria: 'cancelamento',
      });

      Alert.alert(
        'Solicitação enviada',
        'Sua solicitação foi encaminhada à equipe de suporte e será analisada em até 24 horas.',
        [{ text: 'OK', onPress: () => router.replace('/contratations' as any) }],
      );
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Não foi possível concluir a solicitação.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/fundo_neutro_clean.png')}
      style={styles.background}>
      <View style={styles.flex}>
        <View style={[styles.topArea, { paddingTop: insets.top + 8 }]}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={() => router.back()}>
              <Icon name="chevron-back" size={22} color={colors.primary} />
            </TouchableOpacity>
            <NotificationBell />
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
        </View>

        <View style={styles.sheet}>
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.handle} />

            <Text style={styles.title}>Politica de Cancelamento</Text>

            <Text style={styles.policyText}>
              Cancelamentos realizados em até 5 minutos após a confirmação do pedido são
              processados imediatamente e sem custos.
              {'\n'}
              Passado esse prazo, se o serviço já constar com o status{' '}
              <Text style={styles.bold}>Em Andamento</Text> (indicando que o prestador já
              iniciou o trabalho ou deslocamento), será aplicada uma taxa irrenunciável de{' '}
              <Text style={styles.bold}>10%</Text> sobre o valor total para cobrir custos
              operacionais e a reserva da agenda.
              {'\n'}
              Para garantir a segurança e justiça para ambas as partes, cancelamentos nesta
              etapa não são automáticos. A solicitação passará por uma análise individual
              da nossa equipe de suporte em até <Text style={styles.bold}>24 horas</Text>.
              O valor final do estorno será calculado de forma proporcional à quantidade
              de trabalho já executada pelo prestador até o momento do cancelamento.
            </Text>

            <TouchableOpacity
              style={[styles.proceedBtn, submitting && styles.proceedBtnDisabled]}
              activeOpacity={0.85}
              disabled={submitting}
              onPress={handleProceed}>
              {submitting ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={styles.proceedBtnText}>Prosseguir</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <BottomNavBar activeTab="history" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: {
    flex: 1,
    backgroundColor: colors.muttedSurface,
  },
  topArea: {
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
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 24,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 140,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#BFBADE',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 18,
  },
  policyText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
    marginBottom: 24,
  },
  bold: {
    fontFamily: 'OpenSans_700Bold',
  },
  proceedBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedBtnDisabled: {
    opacity: 0.7,
  },
  proceedBtnText: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textWhite,
  },
});
