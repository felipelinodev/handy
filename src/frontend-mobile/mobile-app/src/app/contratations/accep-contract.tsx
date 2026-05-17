import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

import colors from '@/theme/colors';
import { createContract } from '@/features/contracts/services/contractService';
import { reserveAvailabilitySlot } from '@/features/provider/services/scheduleService';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { recordContractNotification } from '@/features/notifications/services/notificationService';
import { buildContractDetails } from '@/features/contracts/utils/contractText';
import { ContractDocument } from '@/features/contracts/components/ContractDocument';

type Params = {
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
  slotId?: string;
  data?: string;
  hora?: string;
  endereco?: string;
  observacoes?: string;
  readonly?: string;
};

function parseInicioIso(date: string, time: string): string | null {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateMatch || !timeMatch) return null;
  const [, dd, mm, yyyy] = dateMatch;
  const [, hh, mn] = timeMatch;
  const d = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(mn),
  );
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function AcceptContractScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();

  const isReadonly = params.readonly === '1';

  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // WebView de assinatura Autentique
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [showSignWebView, setShowSignWebView] = useState(false);
  const [contractCreatedId, setContractCreatedId] = useState<number | null>(null);

  const precoNum = Number(params.preco ?? 0) || 0;
  const precoLabel = `R$ ${precoNum.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const detalhes = useMemo(() => buildContractDetails(params), [params]);

  async function handleSign() {
    if (!accepted || submitting) return;

    const servicoId = Number(params.servicoId);
    const prestadorId = Number(params.prestadorId);
    if (!servicoId || !prestadorId) {
      Alert.alert('Erro', 'Dados do serviço incompletos.');
      return;
    }

    let clienteId: number | null = null;
    let clienteEmail: string | null = null;
    try {
      const userDataString = await AsyncStorage.getItem('@auth_user');
      if (userDataString) {
        const u = JSON.parse(userDataString);
        clienteId = Number(u?.user_id) || null;
        clienteEmail = u?.email || null;
      }
    } catch { }

    if (!clienteId) {
      Alert.alert('Sessão expirada', 'Faça login novamente para contratar.');
      return;
    }

    const inicioIso = parseInicioIso(params.data ?? '', params.hora ?? '');

    try {
      setSubmitting(true);
      const result = await createContract({
        cliente_id: clienteId,
        prestador_id: prestadorId,
        servico_id: servicoId,
        titulo: params.servicoNome ?? 'Contratação de serviço',
        detalhes,
        endereco: params.modo === 'presencial' ? params.endereco : undefined,
        inicio: inicioIso ?? undefined,
      });

      const novoId = result.data?.contratacao_id;
      if (!novoId) {
        Alert.alert('Erro', 'Contrato criado, mas não foi possível abrir o detalhe.');
        return;
      }

      setContractCreatedId(novoId);

      if (params.slotId) {
        try {
          await reserveAvailabilitySlot(Number(params.slotId), novoId);
        } catch (e) {
          console.error("Falha ao reservar o slot: ", e);
        }
      }

      await recordContractNotification(novoId, 'Pendente', {
        servicoNome: params.servicoNome,
        prestadorNome: params.prestadorNome,
      });

      // Pegar link de assinatura (sign_url construído pelo backend via public_id)
      const sigs = result.autentique?.signatures ?? [];
      const clienteSig = sigs.find(
        (s: any) => s.email === clienteEmail,
      );
      const sigLink = (clienteSig as any)?.sign_url
        ?? (sigs[0] as any)?.sign_url
        ?? clienteSig?.link?.short_link
        ?? sigs[0]?.link?.short_link;


      if (sigLink) {
        setSignUrl(sigLink);
        setShowSignWebView(true);
        return;
      }

      // Fallback
      Alert.alert(
        'Contrato criado!',
        'O contrato foi criado com sucesso. O link de assinatura foi enviado para o seu e-mail.',
        [{ text: 'OK', onPress: () => navigateToDetails(novoId) }],
      );
      return;
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Não foi possível assinar o contrato.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCloseWebView() {
    setShowSignWebView(false);
    setSignUrl(null);
    if (contractCreatedId) {
      Alert.alert(
        'Assinatura enviada!',
        'Sua assinatura digital foi registrada. O prestador também recebera o contrato para assinar.',
        [{ text: 'OK', onPress: () => navigateToDetails(contractCreatedId!) }],
      );
    }
  }

  function navigateToDetails(novoId: number) {
    router.replace({
      pathname: '/contratations/[id]' as any,
      params: {
        id: String(novoId),
        servicoId: params.servicoId ?? '',
        prestadorId: params.prestadorId ?? '',
        servicoNome: params.servicoNome ?? '',
        servicoDescricao: params.servicoDescricao ?? '',
        preco: params.preco ?? '0',
        prestadorNome: params.prestadorNome ?? '',
        prestadorFoto: params.prestadorFoto ?? '',
        prestadorCategoria: params.prestadorCategoria ?? '',
        prestadorRating: params.prestadorRating ?? '0',
        prestadorClientes: params.prestadorClientes ?? '0',
        modo: params.modo ?? 'presencial',
        data: params.data ?? '',
        hora: params.hora ?? '',
        endereco: params.endereco ?? '',
        observacoes: params.observacoes ?? '',
        status: 'Pendente',
      },
    });
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/fundo_neutro_clean.png')}
      style={styles.background}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Icon name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <NotificationBell />
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />

        <View style={styles.downloadRow}>
          <TouchableOpacity style={styles.downloadButton} activeOpacity={0.85}>
            <Icon name="download-outline" size={16} color={colors.textDark} />
            <Text style={styles.downloadText}>Baixar Contrato</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.contractScroll}
          contentContainerStyle={styles.contractContent}
          showsVerticalScrollIndicator>
          <ContractDocument
            prestadorNome={params.prestadorNome}
            servicoNome={params.servicoNome}
            precoLabel={precoLabel}
            modo={params.modo}
            data={params.data}
            hora={params.hora}
            endereco={params.endereco}
            observacoes={params.observacoes}
          />
        </ScrollView>

        {!isReadonly && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.7}
              onPress={() => setAccepted((v) => !v)}>
              <View
                style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                {accepted && (
                  <Icon name="checkmark" size={14} color={colors.textWhite} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Li e concordo com todos{'\n'}os termos do contrato
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.signButton,
                !accepted && styles.signButtonDisabled,
              ]}
              activeOpacity={0.85}
              disabled={!accepted || submitting}
              onPress={handleSign}>
              {submitting ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={styles.signButtonText}>Assinar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* WebView Modal para assinatura Autentique */}
      <Modal
        visible={showSignWebView}
        animationType="slide"
        onRequestClose={handleCloseWebView}
        statusBarTranslucent>
        <View style={[styles.webViewContainer, { paddingTop: insets.top }]}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              style={styles.webViewCloseButton}
              onPress={handleCloseWebView}
              hitSlop={10}>
              <Icon name="close" size={22} color={colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Assinatura Digital</Text>
            <View style={{ width: 34 }} />
          </View>

          {signUrl && (
            <WebView
              source={{ uri: signUrl }}
              style={styles.webView}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              mixedContentMode="always"
              thirdPartyCookiesEnabled
              sharedCookiesEnabled
              setSupportMultipleWindows={false}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error:', nativeEvent);
                setShowSignWebView(false);
                Linking.openURL(signUrl).catch(() => { });
                if (contractCreatedId) {
                  navigateToDetails(contractCreatedId);
                }
              }}
            />
          )}
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.muttedSurface,
  },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 16,
  },
  iconButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FAF5FF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4A1D96', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5,
  },
  sheet: {
    flex: 1, backgroundColor: colors.surfaceInput,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 10,
  },
  handle: {
    alignSelf: 'center', width: 44, height: 5, borderRadius: 3,
    backgroundColor: '#E0DDF7', marginBottom: 16,
  },
  downloadRow: { flexDirection: 'row', marginBottom: 12 },
  downloadButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10,
    backgroundColor: colors.muttedSurface,
  },
  downloadText: { fontSize: 12, fontFamily: 'OpenSans_700Bold', color: colors.textDark },
  contractScroll: { flex: 1 },
  contractContent: { paddingBottom: 16 },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxChecked: { backgroundColor: colors.primary },
  checkboxLabel: {
    flex: 1, fontSize: 12, lineHeight: 16,
    fontFamily: 'OpenSans_600SemiBold', color: colors.textDark,
  },
  signButton: {
    paddingHorizontal: 28, height: 44, borderRadius: 12,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  signButtonDisabled: { backgroundColor: '#CBC3F8' },
  signButtonText: { color: colors.textWhite, fontSize: 15, fontFamily: 'OpenSans_700Bold' },

  // WebView Modal
  webViewContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  webViewCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.muttedSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webViewTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  webView: {
    flex: 1,
  },
});
