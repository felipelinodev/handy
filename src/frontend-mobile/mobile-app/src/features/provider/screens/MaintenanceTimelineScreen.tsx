import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import Icon from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '@/shared/utils/colors';
import { MaintenanceHeader } from '@/features/provider/components/MaintenanceHeader';
import { TimelineCard } from '@/features/provider/components/TimelineCard';
import {
  CreateBreakpointSheet,
  BreakpointFormResult,
  ContractOption,
} from '@/features/provider/components/CreateBreakpointSheet';
import { ClientMaintenanceHeader } from '@/features/provider/components/ClientMaintenanceHeader';
import { FilterOption } from '@/features/provider/data/mockMaintenance';
import { Breakpoint } from '@/features/provider/types';
import {
  BackendBreakpoint,
  createBreakpoint,
  listBreakpointsByPrestador,
} from '@/features/provider/services/breakpointService';
import { ensureThreadByContratacao } from '@/services/conversationsService';
import {
  Contratacao,
  fetchClientContracts,
  fetchPrestadorContracts,
} from '@/features/contracts/services/contractService';
import { fetchClientById } from '@/services/clientService';
import { fetchProfessionalById } from '@/features/professionals/services/professionalService';

type RouteParams = {
  clienteId?: string;
  mensagemId?: string;
  contratoId?: string;
  titulo?: string;
  subtitulo?: string;
};

const LOCAL_META_KEY = '@maintenance_breakpoint_meta';

interface LocalMeta {
  status: Breakpoint['status'];
  data: string;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDate(dateStr: string): number {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return 0;
  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day).getTime();
}

const STATUS_MAP: Record<string, Breakpoint['status']> = {
  Geral: 'pendente',
  Pendente: 'pendente',
  'Em Andamento': 'em_andamento',
  'Concluído': 'concluido',
};

async function readLocalMeta(): Promise<Record<string, LocalMeta>> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_META_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LocalMeta>) : {};
  } catch {
    return {};
  }
}

async function writeLocalMeta(meta: Record<string, LocalMeta>): Promise<void> {
  await AsyncStorage.setItem(LOCAL_META_KEY, JSON.stringify(meta));
}

function toUiBreakpoint(
  bp: BackendBreakpoint,
  meta: Record<string, LocalMeta>,
): Breakpoint {
  const m = meta[String(bp.breakpoint_id)];
  return {
    id: String(bp.breakpoint_id),
    titulo: bp.titulo,
    descricao: bp.descricao ?? '',
    data: m?.data ?? formatDate(bp.data_criacao),
    comentarios: [],
    status: m?.status ?? 'pendente',
  };
}

export default function MaintenanceTimelineScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<RouteParams>();

  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('Geral');
  const [showSheet, setShowSheet] = useState(false);
  const [prestadorId, setPrestadorId] = useState<number | null>(null);
  const [tipoUsuario, setTipoUsuario] = useState<'cliente' | 'prestador'>('prestador');
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [currentContractIndex, setCurrentContractIndex] = useState(0);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [providerInfo, setProviderInfo] = useState<any>(null);

  const headerTitulo = params.titulo ?? 'Acompanhamento';
  const headerSubtitulo = params.subtitulo ?? 'Manutenção / breakpoints do prestador';
  const headerContratoId = params.contratoId ?? '';

  const defaultContratacaoId = useMemo(() => {
    if (!params.contratoId) return undefined;
    const cid = Number(params.contratoId);
    return Number.isNaN(cid) ? undefined : cid;
  }, [params.contratoId]);

  const refreshFromApi = useCallback(async (pid: number) => {
    setLoading(true);
    try {
      const [list, meta] = await Promise.all([
        listBreakpointsByPrestador(pid),
        readLocalMeta(),
      ]);
      setBreakpoints(list.map((bp) => toUiBreakpoint(bp, meta)));
    } catch (err: any) {
      Alert.alert('Erro', err?.message ?? 'Falha ao carregar breakpoints.');
      setBreakpoints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshContracts = useCallback(async (pid: number) => {
    setContractsLoading(true);
    try {
      const raw: Contratacao[] = await fetchPrestadorContracts(pid);
      const uniqueClients = Array.from(new Set(raw.map((c) => c.cliente_id)));
      const nameMap = new Map<number, string>();
      await Promise.all(
        uniqueClients.map(async (id) => {
          const info = await fetchClientById(id);
          nameMap.set(id, info?.nome ?? `Cliente #${id}`);
        }),
      );
      const options: ContractOption[] = raw.map((c) => ({
        contratacao_id: c.contratacao_id,
        cliente_id: c.cliente_id,
        cliente_nome: nameMap.get(c.cliente_id) ?? null,
        titulo: c.titulo ?? null,
        status: c.status ?? null,
      }));
      options.sort((a, b) => b.contratacao_id - a.contratacao_id);
      setContracts(options);
    } catch {
      setContracts([]);
    } finally {
      setContractsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@auth_user');
        if (!raw) {
          Alert.alert('Sessão expirada', 'Faça login novamente.');
          setLoading(false);
          return;
        }
        const u = JSON.parse(raw);
        const userId = Number(u?.user_id);
        const tipo = u?.tipo_usuario === 'prestador' ? 'prestador' : 'cliente';

        setTipoUsuario(tipo);

        if (tipo === 'prestador') {
          setPrestadorId(userId);
          await Promise.all([refreshFromApi(userId), refreshContracts(userId)]);
        } else {
          // Cliente: Busca contratos do cliente e info do prestador do contrato atual
          await refreshClientFlow(userId);
        }
      } catch {
        setLoading(false);
      }
    })();
  }, [refreshFromApi, refreshContracts]);

  async function refreshClientFlow(clienteId: number) {
    setLoading(true);
    try {
      const allContracts = await fetchClientContracts(clienteId);
      if (allContracts.length === 0) {
        setLoading(false);
        return;
      }

      const options: ContractOption[] = allContracts.map(c => ({
        contratacao_id: c.contratacao_id,
        cliente_id: c.cliente_id,
        prestador_id: c.prestador_id,
        titulo: c.titulo,
        status: c.status,
      }));
      setContracts(options);

      // Pega o primeiro ou o do params
      let index = 0;
      if (params.contratoId) {
        const found = options.findIndex(o => String(o.contratacao_id) === params.contratoId);
        if (found !== -1) index = found;
      }
      setCurrentContractIndex(index);

      const target = allContracts[index];
      const [bpList, pInfo, meta] = await Promise.all([
        listBreakpointsByPrestador(target.prestador_id),
        fetchProfessionalById(target.prestador_id),
        readLocalMeta(),
      ]);

      // Filtra os BPs apenas para este contrato (o backend retorna todos do prestador)
      // Nota: No mundo real, filtraríamos por contratacao_id se existisse no BP.
      // Aqui usamos o que temos.
      setBreakpoints(bpList.map(bp => toUiBreakpoint(bp, meta)));
      setProviderInfo({
        nome: pInfo?.name ?? 'Prestador',
        especialidade: pInfo?.category ?? 'Serviços',
        rating: pInfo?.rating ?? 5.0,
        photo_url: pInfo?.photoUrl,
        clientsCount: pInfo?.clientsCount ?? 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSwitchContract(index: number) {
    if (index < 0 || index >= contracts.length) return;
    const target = contracts[index];
    setCurrentContractIndex(index);
    // Recarrega dados para o novo contrato (prestador pode ser diferente)
    // No caso do cliente, o prestadorId muda conforme o contrato
    refreshClientFlowForContract(target);
  }

  async function refreshClientFlowForContract(contract: ContractOption) {
    setLoading(true);
    try {
      const pid = contract.prestador_id!;
      const [bpList, pInfo, meta] = await Promise.all([
        listBreakpointsByPrestador(pid),
        fetchProfessionalById(pid),
        readLocalMeta(),
      ]);
      setBreakpoints(bpList.map(bp => toUiBreakpoint(bp, meta)));
      setProviderInfo({
        nome: pInfo?.name ?? 'Prestador',
        especialidade: pInfo?.category ?? 'Serviços',
        rating: pInfo?.rating ?? 5.0,
        photo_url: pInfo?.photoUrl,
        clientsCount: pInfo?.clientsCount ?? 0,
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredBreakpoints =
    activeFilter === 'Geral'
      ? breakpoints
      : breakpoints.filter((bp) => bp.status === STATUS_MAP[activeFilter]);

  const handleFilterChange = useCallback((filter: FilterOption) => {
    setActiveFilter(filter);
  }, []);

  async function persistLocalMeta(
    id: string,
    next: Partial<LocalMeta>,
  ): Promise<void> {
    const meta = await readLocalMeta();
    const prev = meta[id] ?? { status: 'pendente', data: '' };
    meta[id] = { ...prev, ...next };
    await writeLocalMeta(meta);
  }

  function handleEdit(bp: Breakpoint) {
    Alert.alert(
      bp.titulo,
      'Alterar status deste breakpoint:\n(o status é local — backend não armazena)',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Concluído',
          onPress: async () => {
            await persistLocalMeta(bp.id, { status: 'concluido' });
            setBreakpoints((prev) =>
              prev.map((item) =>
                item.id === bp.id ? { ...item, status: 'concluido' } : item,
              ),
            );
          },
        },
        {
          text: 'Em Andamento',
          onPress: async () => {
            await persistLocalMeta(bp.id, { status: 'em_andamento' });
            setBreakpoints((prev) =>
              prev.map((item) =>
                item.id === bp.id ? { ...item, status: 'em_andamento' } : item,
              ),
            );
          },
        },
      ],
    );
  }

  async function handleSaveBreakpoint(form: BreakpointFormResult) {
    if (!prestadorId) {
      Alert.alert('Erro', 'Não foi possível identificar o prestador logado.');
      return;
    }

    try {
      setSubmitting(true);

      // Garante que exista conversa+mensagem para a FK do breakpoint
      const thread = await ensureThreadByContratacao(form.contratacaoId);

      const created = await createBreakpoint({
        prestador_id: prestadorId,
        cliente_id: form.clienteId,
        mensagem_id: thread.mensagem_id,
        titulo: form.titulo,
        descricao: form.descricao,
      });

      await persistLocalMeta(String(created.breakpoint_id), {
        status: 'pendente',
        data: form.data,
      });

      setShowSheet(false);
      await refreshFromApi(prestadorId);
      Alert.alert('Breakpoint criado', `"${form.titulo}" foi salvo no banco.`);
    } catch (err: any) {
      Alert.alert('Erro', err?.message ?? 'Não foi possível criar o breakpoint.');
    } finally {
      setSubmitting(false);
    }
  }

  const totalCount = breakpoints.length;
  const doneCount = breakpoints.filter((b) => b.status === 'concluido').length;

  return (
    <ImageBackground
      source={require('../../../assets/fundo_neutro_clean.png')}
      style={styles.background}>
      <ScrollView
        style={[styles.scroll, { paddingTop: insets.top + 8 }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {tipoUsuario === 'prestador' ? (
          <MaintenanceHeader
            titulo={headerTitulo}
            subtitulo={headerSubtitulo}
            contratoId={headerContratoId}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        ) : (
          <ClientMaintenanceHeader
            titulo={contracts[currentContractIndex]?.titulo ?? headerTitulo}
            subtitulo={headerSubtitulo}
            contratoId={String(contracts[currentContractIndex]?.contratacao_id ?? '')}
            provider={providerInfo}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            onPrevContract={() => handleSwitchContract(currentContractIndex - 1)}
            onNextContract={() => handleSwitchContract(currentContractIndex + 1)}
          />
        )}

        {totalCount > 0 && (
          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {doneCount}/{totalCount} concluídos
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Carregando breakpoints...</Text>
          </View>
        ) : filteredBreakpoints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Icon name="flag-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Nenhum breakpoint</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'Geral'
                ? 'Crie o primeiro breakpoint para\nacompanhar a manutenção.'
                : `Nenhum breakpoint com status "${activeFilter}".`}
            </Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {filteredBreakpoints
              .slice()
              .sort((a, b) => parseDate(a.data) - parseDate(b.data))
              .map((bp, index) => (
                <TimelineCard
                  key={bp.id}
                  breakpoint={bp}
                  alignment={index % 2 === 0 ? 'left' : 'right'}
                  showConnector={index < filteredBreakpoints.length - 1}
                  onEdit={tipoUsuario === 'prestador' ? handleEdit : undefined}
                />
              ))}
          </View>
        )}
      </ScrollView>

      {tipoUsuario === 'prestador' && (
        <View style={[styles.fabContainer, { bottom: insets.bottom + 24 }]}>
          <TouchableOpacity
            style={styles.fab}
            activeOpacity={0.85}
            onPress={() => setShowSheet(true)}>
            <Icon name="add" size={20} color={colors.primary} />
            <Text style={styles.fabText}>Novo Breakpoint</Text>
          </TouchableOpacity>
        </View>
      )}

      <CreateBreakpointSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onSave={handleSaveBreakpoint}
        contracts={contracts}
        contractsLoading={contractsLoading}
        defaultContratacaoId={defaultContratacaoId}
        submitting={submitting}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.muttedSurface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  timelineContainer: {
    marginTop: 12,
    paddingBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  fabText: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
});
