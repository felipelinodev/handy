import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Icon from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, getHeaders } from '../../services/apiConfig';

import colors from '../../utils/colors';
import { BottomNavBar } from '../../components/BottomNavBar';
import { NotificationBell } from '../../components/NotificationBell';
import {
  Contratacao,
  fetchProviderContracts,
  updateContractStatus,
} from '../../services/contractService';
import {
  fetchProfessionalById,
  ProfessionalListItem,
  ProfessionalService,
} from '../../services/professionalService';
import { useProviderGuard } from '../../utils/useProviderGuard';

const PROFILE_PLACEHOLDER = require('../../assets/fundo_neutro.png');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const STATUS_LABEL: Record<string, string> = {
  Pendente: 'Pendente',
  Aceita: 'Aceita',
  Em_Andamento: 'Em andamento',
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

interface EnrichedContract {
  contrato: Contratacao;
  clienteNome: string;
  clienteFoto: string | null;
  servico: ProfessionalService | null;
  parsed: ParsedDetalhes;
}

interface ParsedDetalhes {
  modo: 'presencial' | 'digital';
  data: string;
  hora: string;
  observacoes: string;
}

function parseDetalhes(detalhes: string | null): ParsedDetalhes {
  const result: ParsedDetalhes = { modo: 'presencial', data: '', hora: '', observacoes: '' };
  const lines = (detalhes ?? '').split(/\r?\n/);
  let inObs = false;
  const obs: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { if (inObs) obs.push(''); continue; }
    if (line.toLowerCase().startsWith('tipo de serviço:')) {
      inObs = false;
      result.modo = line.toLowerCase().includes('digital') ? 'digital' : 'presencial';
    } else if (line.toLowerCase().startsWith('agendamento:')) {
      inObs = false;
      const m = /(\d{2}\/\d{2}\/\d{4})\s+às\s+(\d{2}:\d{2})/.exec(line);
      if (m) { result.data = m[1]; result.hora = m[2]; }
    } else if (line.toLowerCase().startsWith('observações do cliente')) {
      inObs = true;
    } else if (inObs) {
      obs.push(line);
    }
  }
  result.observacoes = obs.join('\n').trim();
  return result;
}

function prazoLabel(p: ParsedDetalhes): string {
  if (p.data && p.data.length === 10) {
    const parts = p.data.split('/');
    if (parts.length === 3) {
      const target = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      const now = new Date();
      const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0) return `${diff} dias`;
      if (diff === 0) return 'Hoje';
      return 'Vencido';
    }
  }
  return '—';
}

export default function ProviderContractsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const guardAllowed = useProviderGuard();
  const [items, setItems] = useState<EnrichedContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<EnrichedContract | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const userDataStr = await AsyncStorage.getItem('@auth_user');
      const u = userDataStr ? JSON.parse(userDataStr) : null;
      const prestadorId = Number(u?.user_id);
      if (!prestadorId) {
        setErrorMsg('Faça login para ver seus contratos.');
        setItems([]);
        return;
      }

      const contratos = await fetchProviderContracts(prestadorId);
      let prestadorData: ProfessionalListItem | null = null;
      try {
        prestadorData = await fetchProfessionalById(prestadorId);
      } catch { }

      const enriched: EnrichedContract[] = [];
      for (const contrato of contratos) {
        const servico = prestadorData?.services.find((s) => s.id === contrato.servico_id) ?? null;
        enriched.push({
          contrato,
          clienteNome: contrato.titulo,
          clienteFoto: null,
          servico,
          parsed: parseDetalhes(contrato.detalhes),
        });
      }

      try {
        const headers = await getHeaders();
        for (const item of enriched) {
          try {
            const res = await fetch(
              `${BASE_URL}/client/view-client/${item.contrato.cliente_id}`,
              { headers },
            );
            if (res.ok) {
              const clientData = await res.json();
              item.clienteNome = clientData?.nome ?? item.clienteNome;
              item.clienteFoto = clientData?.photo_url ?? null;
            }
          } catch { }
        }
      } catch { }

      enriched.sort((a, b) => b.contrato.contratacao_id - a.contrato.contratacao_id);
      setItems(enriched);
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Erro ao carregar os contratos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function openSheet(item: EnrichedContract) {
    setSelectedItem(item);
    const isPendente = (item.contrato.status ?? 'Pendente') === 'Pendente';
    if (isPendente) {
      setModalVisible(true);
    } else {
      setSheetVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }

  function closeSheet() {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setSheetVisible(false);
      setSelectedItem(null);
    });
  }

  function handleRecusar() {
    if (!selectedItem) return;
    const item = selectedItem;
    Alert.alert(
      'Recusar solicitação',
      `Tem certeza que deseja recusar o serviço "${item.servico?.name ?? item.contrato.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: async () => {
            try {
              setRejecting(true);
              await updateContractStatus(item.contrato.contratacao_id, 'Cancelada');
              setModalVisible(false);
              setSelectedItem(null);
              await load();
            } catch (error: any) {
              Alert.alert('Erro', error?.message ?? 'Não foi possível recusar a solicitação.');
            } finally {
              setRejecting(false);
            }
          },
        },
      ],
    );
  }

  async function handleProsseguir() {
    if (!selectedItem) return;
    setModalVisible(false);
    setSheetVisible(false);
    closeSheet();
    const { contrato, servico, parsed, clienteNome } = selectedItem;
    const userDataStr = await AsyncStorage.getItem('@auth_user');
    const u = userDataStr ? JSON.parse(userDataStr) : null;
    const prestadorNome = u?.nome ?? 'Prestador';
    router.push({
      pathname: '/contratations/provider-accept-contract' as any,
      params: {
        id: String(contrato.contratacao_id),
        servicoNome: servico?.name ?? contrato.titulo,
        servicoDescricao: servico?.description ?? '',
        preco: String(servico?.price ?? 0),
        clienteNome,
        prestadorNome,
        modo: parsed.modo,
        data: parsed.data,
        hora: parsed.hora,
        endereco: contrato.endereco ?? '',
        observacoes: parsed.observacoes,
        status: contrato.status ?? 'Pendente',
      },
    });
  }

  const precoFormat = (p: number) =>
    `R$ ${p.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <ImageBackground source={require('../../assets/fundo_neutro_clean.png')} style={styles.background}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.logoRow}>
          <Image source={require('../../assets/logo_completa.png')} style={styles.logo} contentFit="contain" />
        </View>
        <NotificationBell />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.screenTitle}>Clientes Atuais</Text>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <Text style={styles.filterText}>Todos</Text>
          <Icon name="options-outline" size={16} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      {loading || guardAllowed === null || guardAllowed === false ? (
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
          <Icon name="people-outline" size={36} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhum cliente ainda</Text>
          <Text style={styles.emptyText}>Quando um cliente contratar seus serviços, ele aparece aqui.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
          showsVerticalScrollIndicator={false}>
          {items.map((item) => {
            const status = item.contrato.status ?? 'Pendente';
            const statusLabel = STATUS_LABEL[status] ?? status;
            const statusStyle = STATUS_STYLES[status] ?? { bg: colors.muttedSurface, fg: colors.textDark };
            const preco = item.servico?.price ?? 0;
            return (
              <TouchableOpacity
                key={item.contrato.contratacao_id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => openSheet(item)}>
                <View style={styles.cardAvatarWrap}>
                  <Image
                    source={item.clienteFoto ? { uri: item.clienteFoto } : PROFILE_PLACEHOLDER}
                    style={styles.cardAvatar}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                  {status === 'Pendente' && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>!</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardName} numberOfLines={1}>{item.clienteNome}</Text>
                    <Text style={styles.cardPrice}>{precoFormat(preco)}</Text>
                  </View>
                  <View style={styles.cardBottomRow}>
                    <Text style={styles.cardService} numberOfLines={1}>
                      {item.servico?.name ?? item.contrato.titulo}
                    </Text>
                    <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusPillText, { color: statusStyle.fg }]}>{statusLabel}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {sheetVisible && selectedItem && (
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }], paddingBottom: insets.bottom + 24 }]}>
                <View style={styles.handle} />
                <Text style={styles.sheetTitle}>Descrição do serviço</Text>
                <Text style={styles.sheetDesc}>
                  {selectedItem.servico?.description || 'Sem descrição disponível.'}
                </Text>
                {selectedItem.parsed.observacoes.length > 0 && (
                  <Text style={styles.sheetDesc}>{selectedItem.parsed.observacoes}</Text>
                )}
                <View style={styles.sheetMeta}>
                  <View style={styles.sheetMetaItem}>
                    <Icon name="document-text-outline" size={18} color={colors.primary} />
                    <View>
                      <Text style={styles.sheetMetaLabel}>Valor do serviço</Text>
                      <Text style={styles.sheetMetaValue}>
                        {precoFormat(selectedItem.servico?.price ?? 0)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.sheetMetaDivider} />
                  <View style={styles.sheetMetaItem}>
                    <Icon name="location-outline" size={18} color={colors.primary} />
                    <View>
                      <Text style={styles.sheetMetaLabel}>Local</Text>
                      <Text style={styles.sheetMetaValue}>
                        {selectedItem.contrato.endereco
                          ? selectedItem.contrato.endereco.split(',')[0]?.trim()
                          : selectedItem.parsed.modo === 'digital'
                            ? 'Plataforma'
                            : '—'}
                      </Text>
                    </View>
                  </View>
                </View>
                {selectedItem.contrato.status === 'Aceita' && (
                  <TouchableOpacity style={styles.sheetButton} activeOpacity={0.85} onPress={handleProsseguir}>
                    <Text style={styles.sheetButtonText}>Ver Contrato</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.sheetOutlineButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    const item = selectedItem!;
                    closeSheet();
                    router.push({
                      pathname: '/maintenance' as any,
                      params: {
                        contratacaoId: String(item.contrato.contratacao_id),
                        servicoNome: item.servico?.name ?? item.contrato.titulo,
                        clienteNome: item.clienteNome,
                      },
                    });
                  }}>
                  <Icon name="construct-outline" size={18} color={colors.textDark} />
                  <Text style={styles.sheetOutlineText}>Acompanhar Serviço</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => !rejecting && setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.handle} />
                <View style={styles.modalIconWrap}>
                  <View style={styles.modalDecorDot1} />
                  <View style={styles.modalDecorDot2} />
                  <View style={styles.modalDecorDot3} />
                  <View style={styles.modalDecorDot4} />
                  <View style={styles.modalIconCircle}>
                    <Icon name="clipboard-outline" size={36} color="#5C67F2" />
                  </View>
                </View>

                <View style={styles.modalServiceCard}>
                  <Text style={styles.modalServiceTitle} numberOfLines={2}>
                    {selectedItem?.servico?.name ?? selectedItem?.contrato.titulo ?? '—'}
                  </Text>
                  <View style={styles.modalServiceDescBox}>
                    <Text style={styles.modalServiceDesc}>
                      {selectedItem?.servico?.description?.trim()
                        ? selectedItem.servico.description
                        : 'Sem descrição cadastrada para este serviço.'}
                    </Text>
                    {selectedItem?.parsed.observacoes ? (
                      <Text style={styles.modalServiceObs}>
                        <Text style={styles.modalServiceObsLabel}>Observações: </Text>
                        {selectedItem.parsed.observacoes}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.modalInfoCard}>
                  <View style={styles.infoGridTop}>
                    <View style={styles.infoColTop}>
                      <View style={styles.infoIconCircle}>
                        <Icon name="person-outline" size={18} color="#4A5568" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalInfoLabel}>Cliente</Text>
                        <Text style={styles.modalInfoValue} numberOfLines={1}>{selectedItem?.clienteNome ?? '—'}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.infoVerticalDivider} />
                    
                    <View style={styles.infoColTop}>
                      <View style={styles.infoIconCircle}>
                        <Icon name="calendar-outline" size={18} color="#4A5568" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalInfoLabel}>Prazo</Text>
                        <Text style={styles.modalInfoValue} numberOfLines={1}>
                          {selectedItem ? prazoLabel(selectedItem.parsed) : '—'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {!!selectedItem?.servico?.price && (
                    <View style={styles.infoBottomWrap}>
                      <View style={styles.infoHorizontalDivider} />
                      <View style={styles.infoColBottom}>
                        <View style={styles.infoIconCircle}>
                          <Icon name="card-outline" size={18} color="#4A5568" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modalInfoLabel}>Valor</Text>
                          <Text style={[styles.modalInfoValue, { color: '#5A67D8', fontSize: 16 }]}>
                            {precoFormat(selectedItem.servico.price)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.prosseguirButton, rejecting && styles.buttonDisabled]}
                  activeOpacity={0.85}
                  disabled={rejecting}
                  onPress={handleProsseguir}>
                  <Text style={styles.prosseguirButtonText}>Prosseguir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.recusarButton, rejecting && styles.buttonDisabled]}
                  activeOpacity={0.85}
                  disabled={rejecting}
                  onPress={handleRecusar}>
                  {rejecting ? (
                    <ActivityIndicator color="#5C67F2" />
                  ) : (
                    <Text style={styles.recusarButtonText}>Recusar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <BottomNavBar activeTab="history" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.muttedSurface },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 12,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 120, height: 36 },
  titleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, marginBottom: 16,
  },
  screenTitle: { fontSize: 22, fontFamily: 'OpenSans_700Bold', color: colors.textDark },
  filterButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 50,
    shadowColor: '#4A1D96', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 2,
  },
  filterText: { fontSize: 13, fontFamily: 'OpenSans_600SemiBold', color: colors.textDark },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: colors.surface, borderRadius: 18, gap: 12,
    shadowColor: '#4A1D96', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06,
    shadowRadius: 12, elevation: 3,
  },
  cardAvatarWrap: { position: 'relative' },
  cardAvatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#E0D5F0' },
  badge: {
    position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.surface,
  },
  badgeText: { color: colors.textWhite, fontSize: 11, fontFamily: 'OpenSans_700Bold' },
  cardBody: { flex: 1, gap: 4 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 14, fontFamily: 'OpenSans_700Bold', color: colors.textDark, flex: 1, marginRight: 8 },
  cardPrice: { fontSize: 13, fontFamily: 'OpenSans_700Bold', color: colors.primary },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardService: { fontSize: 12, fontFamily: 'OpenSans_400Regular', color: colors.textMuted, flex: 1, marginRight: 8 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  statusPillText: { fontSize: 10, fontFamily: 'OpenSans_700Bold' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 8 },
  emptyTitle: { marginTop: 8, fontSize: 15, fontFamily: 'OpenSans_700Bold', color: colors.textDark },
  emptyText: { fontSize: 12, fontFamily: 'OpenSans_400Regular', color: colors.textMuted, textAlign: 'center' },
  errorText: { fontSize: 13, fontFamily: 'OpenSans_600SemiBold', color: colors.error, textAlign: 'center' },
  retryLink: { fontSize: 13, fontFamily: 'OpenSans_700Bold', color: colors.primary, textDecorationLine: 'underline' },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end',
    zIndex: 200, elevation: 200,
  },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40,
  },
  handle: {
    alignSelf: 'center', width: 44, height: 5, borderRadius: 3,
    backgroundColor: '#E0DDF7', marginBottom: 20,
  },
  sheetTitle: { fontSize: 16, fontFamily: 'OpenSans_700Bold', color: colors.textDark, marginBottom: 12 },
  sheetDesc: {
    fontSize: 13, lineHeight: 20, fontFamily: 'OpenSans_400Regular',
    color: colors.textDark, marginBottom: 12,
  },
  sheetMeta: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.muttedSurface,
    borderRadius: 14, padding: 14, marginBottom: 24,
  },
  sheetMetaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sheetMetaDivider: { width: 1, height: 32, backgroundColor: colors.border, marginHorizontal: 8 },
  sheetMetaLabel: { fontSize: 11, fontFamily: 'OpenSans_400Regular', color: colors.textMuted },
  sheetMetaValue: { fontSize: 13, fontFamily: 'OpenSans_700Bold', color: colors.textDark },
  sheetButton: {
    width: '100%', backgroundColor: colors.primary, borderRadius: 16, height: 54,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetButtonText: { color: colors.textWhite, fontSize: 16, fontFamily: 'OpenSans_700Bold' },
  sheetOutlineButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, width: '100%', height: 54, borderRadius: 50,
    borderWidth: 1.5, borderColor: colors.border, marginTop: 12,
  },
  sheetOutlineText: {
    fontSize: 15, fontFamily: 'OpenSans_700Bold', color: colors.textDark,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F7F5FF', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40, alignItems: 'center',
  },
  modalIconWrap: {
    width: 140, height: 140, alignItems: 'center', justifyContent: 'center',
    marginVertical: 4, position: 'relative',
  },
  modalIconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#EBE6FA',
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#F7F5FF'
  },
  modalDecorDot1: {
    position: 'absolute', top: 20, left: 16, width: 10, height: 10,
    borderRadius: 5, backgroundColor: '#DCD4F6',
  },
  modalDecorDot2: {
    position: 'absolute', top: 10, right: 20, width: 16, height: 16,
    borderRadius: 8, backgroundColor: '#EBE6FA',
  },
  modalDecorDot3: {
    position: 'absolute', bottom: 25, left: 15, width: 20, height: 20,
    borderRadius: 10, backgroundColor: '#E0DDF7',
  },
  modalDecorDot4: {
    position: 'absolute', bottom: 18, right: 25, width: 26, height: 26,
    borderRadius: 13, backgroundColor: '#DCD4F6',
  },
  modalServiceCard: {
    width: '100%',
    backgroundColor: '#EFEBF5',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  modalServiceTitle: {
    fontSize: 17,
    fontFamily: 'OpenSans_700Bold',
    color: '#1A202C',
  },
  modalServiceDescBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  modalServiceDesc: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'OpenSans_400Regular',
    color: '#4A5568',
  },
  modalServiceObs: {
    fontSize: 13, lineHeight: 20, fontFamily: 'OpenSans_400Regular',
    color: '#718096', marginTop: 12,
  },
  modalServiceObsLabel: {
    fontFamily: 'OpenSans_700Bold', color: '#4A5568',
  },
  modalInfoCard: {
    width: '100%', backgroundColor: '#EFEBF5', borderRadius: 20,
    padding: 16, marginBottom: 24,
  },
  infoGridTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  infoColTop: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  infoColBottom: {
    flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%'
  },
  infoBottomWrap: {
    width: '100%',
  },
  infoIconCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2DEF8',
    alignItems: 'center', justifyContent: 'center',
  },
  infoVerticalDivider: {
    width: 1, height: 40, backgroundColor: '#D1CBE3', marginHorizontal: 12,
  },
  infoHorizontalDivider: {
    height: 1, width: '100%', backgroundColor: '#D1CBE3', marginVertical: 14,
  },
  modalInfoLabel: { fontSize: 11, fontFamily: 'OpenSans_400Regular', color: '#718096', marginBottom: 2 },
  modalInfoValue: { fontSize: 14, fontFamily: 'OpenSans_700Bold', color: '#1A202C' },
  prosseguirButton: {
    width: '100%', backgroundColor: '#5A67D8', borderRadius: 14, height: 54,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  prosseguirButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'OpenSans_700Bold' },
  recusarButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: '100%', height: 54, borderRadius: 14, borderWidth: 1.5,
    borderColor: '#5A67D8', backgroundColor: 'transparent',
  },
  recusarButtonText: {
    fontSize: 16, fontFamily: 'OpenSans_700Bold', color: '#5A67D8',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
