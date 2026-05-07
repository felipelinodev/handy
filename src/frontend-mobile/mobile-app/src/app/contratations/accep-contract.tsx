import React, { useMemo, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '@/shared/utils/colors';
import { createContract } from '@/features/contracts/services/contractService';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { recordContractNotification } from '@/features/notifications/services/notificationService';

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

function buildDetalhes(p: Params): string {
  const lines: string[] = [];
  lines.push(`Tipo de serviço: ${p.modo === 'digital' ? 'Digital' : 'Presencial'}`);
  if (p.data && p.hora) lines.push(`Agendamento: ${p.data} às ${p.hora}`);
  if (p.modo === 'presencial' && p.endereco) lines.push(`Endereço: ${p.endereco}`);
  if (p.observacoes && p.observacoes.trim().length > 0) {
    lines.push('');
    lines.push('Observações do cliente:');
    lines.push(p.observacoes);
  }
  return lines.join('\n');
}

export default function AcceptContractScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();

  const isReadonly = params.readonly === '1';

  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const precoNum = Number(params.preco ?? 0) || 0;
  const precoLabel = `R$ ${precoNum.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const detalhes = useMemo(() => buildDetalhes(params), [params]);

  async function handleSign() {
    if (!accepted || submitting) return;

    const servicoId = Number(params.servicoId);
    const prestadorId = Number(params.prestadorId);
    if (!servicoId || !prestadorId) {
      Alert.alert('Erro', 'Dados do serviço incompletos.');
      return;
    }

    let clienteId: number | null = null;
    try {
      const userDataString = await AsyncStorage.getItem('@auth_user');
      if (userDataString) {
        const u = JSON.parse(userDataString);
        clienteId = Number(u?.user_id) || null;
      }
    } catch {}

    if (!clienteId) {
      Alert.alert('Sessão expirada', 'Faça login novamente para contratar.');
      return;
    }

    const inicioIso = parseInicioIso(params.data ?? '', params.hora ?? '');

    try {
      setSubmitting(true);
      const contrato = await createContract({
        cliente_id: clienteId,
        prestador_id: prestadorId,
        servico_id: servicoId,
        titulo: params.servicoNome ?? 'Contratação de serviço',
        detalhes,
        endereco: params.modo === 'presencial' ? params.endereco : undefined,
        inicio: inicioIso ?? undefined,
      });

      const novoId = (contrato as any)?.contratacao_id;
      if (!novoId) {
        Alert.alert('Erro', 'Contrato criado, mas não foi possível abrir o detalhe.');
        return;
      }

      await recordContractNotification(novoId, 'Pendente', {
        servicoNome: params.servicoNome,
        prestadorNome: params.prestadorNome,
      });

      router.replace({
        pathname: '/contratations/[id]' as any,
        params: {
          id: String(novoId),
          servicoId: String(servicoId),
          prestadorId: String(prestadorId),
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
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Não foi possível assinar o contrato.');
    } finally {
      setSubmitting(false);
    }
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
          <Text style={styles.contractText}>
            <Text style={styles.contractBold}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</Text>
            {'\n'}
            <Text style={styles.contractBold}>CONTRATANTE:</Text> Cliente Handy
            {'\n'}
            <Text style={styles.contractBold}>CONTRATADO:</Text>{' '}
            {params.prestadorNome ?? 'Prestador'}
            {'\n'}
            <Text style={styles.contractBold}>CLÁUSULA 1 – OBJETO</Text>
            {'\n'}
            O presente contrato tem como objeto a prestação do serviço{' '}
            <Text style={styles.contractBold}>"{params.servicoNome ?? '—'}"</Text>,
            conforme as necessidades do CONTRATANTE.
            {'\n\n'}
            <Text style={styles.contractBold}>CLÁUSULA 2 – MODALIDADE E AGENDAMENTO</Text>
            {'\n'}
            O serviço será prestado na modalidade{' '}
            <Text style={styles.contractBold}>
              {params.modo === 'digital' ? 'Digital (remota)' : 'Presencial'}
            </Text>
            {params.data && params.hora
              ? `, agendado para ${params.data} às ${params.hora}.`
              : '.'}
            {params.modo === 'presencial' && params.endereco
              ? ` O atendimento ocorrerá no endereço: ${params.endereco}.`
              : ''}
            {'\n\n'}
            <Text style={styles.contractBold}>CLÁUSULA 3 – VALOR E FORMA DE PAGAMENTO</Text>
            {'\n'}
            O CONTRATANTE pagará ao CONTRATADO o valor de{' '}
            <Text style={styles.contractBold}>{precoLabel}</Text>, conforme acordo
            entre as partes.
            {'\n\n'}
            <Text style={styles.contractBold}>CLÁUSULA 4 – OBRIGAÇÕES DO CONTRATADO</Text>
            {'\n'}
            O CONTRATADO se compromete a:
            {'\n'}I – Executar os serviços com qualidade, eficiência e dentro dos
            prazos estabelecidos;
            {'\n'}II – Cumprir o agendamento acordado e comunicar o CONTRATANTE em
            caso de qualquer alteração;
            {'\n'}III – Respeitar as observações e instruções fornecidas pelo
            CONTRATANTE.
            {'\n\n'}
            <Text style={styles.contractBold}>CLÁUSULA 5 – OBSERVAÇÕES DO CONTRATANTE</Text>
            {'\n'}
            {params.observacoes && params.observacoes.trim().length > 0
              ? params.observacoes
              : 'Sem observações adicionais.'}
            {'\n\n'}
            <Text style={styles.contractBold}>CLÁUSULA 6 – DISPOSIÇÕES GERAIS</Text>
            {'\n'}
            Ao assinar este contrato, ambas as partes declaram estar de acordo com
            todos os termos aqui descritos, mediados pela plataforma Handy.
          </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
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
  sheet: {
    flex: 1,
    backgroundColor: colors.surfaceInput,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0DDF7',
    marginBottom: 16,
  },
  downloadRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.muttedSurface,
  },
  downloadText: {
    fontSize: 12,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  contractScroll: {
    flex: 1,
  },
  contractContent: {
    paddingBottom: 16,
  },
  contractText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
    textAlign: 'justify',
  },
  contractBold: {
    fontFamily: 'OpenSans_700Bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
  },
  signButton: {
    paddingHorizontal: 28,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signButtonDisabled: {
    backgroundColor: '#CBC3F8',
  },
  signButtonText: {
    color: colors.textWhite,
    fontSize: 15,
    fontFamily: 'OpenSans_700Bold',
  },
});
