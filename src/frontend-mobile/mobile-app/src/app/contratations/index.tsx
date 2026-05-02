import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Icon from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '../../utils/colors';
import { BottomNavBar } from '../../components/BottomNavBar';
import { NotificationBell } from '../../components/NotificationBell';
import { Contratacao, fetchClientContracts, fetchPrestadorContracts } from '../../services/contractService';
import {
  fetchProfessionalById,
  ProfessionalListItem,
  ProfessionalService,
} from '../../services/professionalService';
import { syncContractNotifications } from '../../services/notificationService';

const PROFILE_PLACEHOLDER = require('../../assets/fundo_neutro.png');

interface EnrichedContract {
  contrato: Contratacao;
  prestador: ProfessionalListItem | null;
  servico: ProfessionalService | null;
  parsed: ParsedDetalhes;
}

interface ParsedDetalhes {
  modo: 'presencial' | 'digital';
  data: string;
  hora: string;
  observacoes: string;
}

const STATUS_LABEL: Record<string, string> = {
  Pendente: 'Pendente',
  Aceita: 'Aceita',
  Em_Andamento: 'Em Andamento',
  Concluida: 'Concluída',
  'Concluída': 'Concluída',
  Cancelada: 'Cancelada',
};

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Pendente: { bg: '#FFF1C2', fg: '#A06A00' },
  Aceita: { bg: '#D6E4FF', fg: '#1E40AF' },
  Em_Andamento: { bg: '#E0DDF7', fg: colors.primary },
  Concluida: { bg: '#D1FAE5', fg: '#065F46' },
  'Concluída': { bg: '#D1FAE5', fg: '#065F46' },
  Cancelada: { bg: '#FEE2E2', fg: '#B91C1C' },
};

function parseDetalhes(detalhes: string | null): ParsedDetalhes {
  const result: ParsedDetalhes = {
    modo: 'presencial',
    data: '',
    hora: '',
    observacoes: '',
  };
  const text = detalhes ?? '';
  const lines = text.split(/\r?\n/);
  let inObs = false;
  const obs: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inObs) obs.push('');
      continue;
    }
    if (line.toLowerCase().startsWith('tipo de serviço:')) {
      inObs = false;
      result.modo = line.toLowerCase().includes('digital') ? 'digital' : 'presencial';
    } else if (line.toLowerCase().startsWith('agendamento:')) {
      inObs = false;
      const m = /(\d{2}\/\d{2}\/\d{4})\s+às\s+(\d{2}:\d{2})/.exec(line);
      if (m) {
        result.data = m[1];
        result.hora = m[2];
      }
    } else if (line.toLowerCase().startsWith('endereço:')) {
      inObs = false;
    } else if (line.toLowerCase().startsWith('observações do cliente')) {
      inObs = true;
    } else if (inObs) {
      obs.push(line);
    }
  }
  result.observacoes = obs.join('\n').trim();
  return result;
}

export default function ContractsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<EnrichedContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const userDataStr = await AsyncStorage.getItem('@auth_user');
      const u = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = Number(u?.user_id);
      const tipoUsuario: string = u?.tipo_usuario ?? 'cliente';
      if (!userId) {
        setErrorMsg('Faça login para ver seus contratos.');
        setItems([]);
        return;
      }

      const contratos =
        tipoUsuario === 'prestador'
          ? await fetchPrestadorContracts(userId)
          : await fetchClientContracts(userId);

      const prestadorCache = new Map<number, ProfessionalListItem | null>();
      const enriched: EnrichedContract[] = [];

      for (const contrato of contratos) {
        let prestador = prestadorCache.get(contrato.prestador_id);
        if (prestador === undefined) {
          try {
            prestador = await fetchProfessionalById(contrato.prestador_id);
          } catch {
            prestador = null;
          }
          prestadorCache.set(contrato.prestador_id, prestador);
        }
        const servico =
          prestador?.services.find((s) => s.id === contrato.servico_id) ?? null;

        enriched.push({
          contrato,
          prestador,
          servico,
          parsed: parseDetalhes(contrato.detalhes),
        });
      }

      enriched.sort((a, b) => b.contrato.contratacao_id - a.contrato.contratacao_id);
      setItems(enriched);

      const metaById = new Map<number, { servicoNome?: string; prestadorNome?: string }>();
      for (const e of enriched) {
        metaById.set(e.contrato.contratacao_id, {
          servicoNome: e.servico?.name ?? e.contrato.titulo,
          prestadorNome: e.prestador?.name,
        });
      }
      await syncContractNotifications(contratos, (c) =>
        metaById.get(c.contratacao_id),
      );
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Erro ao carregar os contratos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function openContract(item: EnrichedContract) {
    const { contrato, prestador, servico, parsed } = item;
    router.push({
      pathname: '/contratations/[id]' as any,
      params: {
        id: String(contrato.contratacao_id),
        servicoId: String(contrato.servico_id),
        prestadorId: String(contrato.prestador_id),
        servicoNome: servico?.name ?? contrato.titulo,
        servicoDescricao: servico?.description ?? '',
        preco: String(servico?.price ?? 0),
        prestadorNome: prestador?.name ?? '',
        prestadorFoto: prestador?.photoUrl ?? '',
        prestadorCategoria: prestador?.category ?? '',
        prestadorRating: String(prestador?.rating ?? 0),
        prestadorClientes: String(prestador?.clientsCount ?? 0),
        modo: parsed.modo,
        data: parsed.data,
        hora: parsed.hora,
        endereco: contrato.endereco ?? '',
        observacoes: parsed.observacoes,
        status: contrato.status ?? 'Pendente',
      },
    });
  }

  return (
    <ImageBackground
      source={require('../../assets/fundo_neutro_clean.png')}
      style={styles.background}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Icon name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Meus Contratos</Text>
        <NotificationBell />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : errorMsg ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity onPress={load}>
            <Text style={styles.retryLink}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Icon name="document-text-outline" size={36} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhum contrato ainda</Text>
          <Text style={styles.emptyText}>
            Quando você contratar um serviço, ele aparece aqui.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 140 },
          ]}
          showsVerticalScrollIndicator={false}>
          {items.map((item) => {
            const status = item.contrato.status ?? 'Pendente';
            const statusLabel = STATUS_LABEL[status] ?? status;
            const statusStyle =
              STATUS_STYLES[status] ?? {
                bg: colors.muttedSurface,
                fg: colors.textDark,
              };
            const preco = item.servico?.price ?? 0;
            const precoLabel = `R$ ${preco.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
            return (
              <TouchableOpacity
                key={item.contrato.contratacao_id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => openContract(item)}>
                <Image
                  source={
                    item.prestador?.photoUrl
                      ? { uri: item.prestador.photoUrl }
                      : PROFILE_PLACEHOLDER
                  }
                  style={styles.cardAvatar}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.servico?.name ?? item.contrato.titulo}
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {item.prestador?.name ?? 'Prestador'}
                  </Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardPrice}>{precoLabel}</Text>
                    {item.parsed.data ? (
                      <Text style={styles.cardDate}>
                        <Icon
                          name="calendar-outline"
                          size={11}
                          color={colors.textMuted}
                        />{' '}
                        {item.parsed.data}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: statusStyle.bg },
                  ]}>
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: statusStyle.fg },
                    ]}>
                    {statusLabel}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <BottomNavBar activeTab="history" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
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
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  screenTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    gap: 12,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardAvatar: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#E0D5F0',
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  cardPrice: {
    fontSize: 13,
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
  },
  cardDate: {
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: 'OpenSans_700Bold',
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
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.error,
    textAlign: 'center',
  },
  retryLink: {
    fontSize: 13,
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
