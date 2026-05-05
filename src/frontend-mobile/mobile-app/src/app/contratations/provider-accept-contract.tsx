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

import colors from '../../utils/colors';
import { updateContractStatus } from '../../services/contractService';
import { NotificationBell } from '../../components/NotificationBell';

type Params = {
  id?: string;
  servicoNome?: string;
  servicoDescricao?: string;
  preco?: string;
  clienteNome?: string;
  prestadorNome?: string;
  modo?: 'presencial' | 'digital';
  data?: string;
  hora?: string;
  endereco?: string;
  observacoes?: string;
  status?: string;
};

export default function ProviderAcceptContractScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();

  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const precoNum = Number(params.preco ?? 0) || 0;
  const precoLabel = `R$ ${precoNum.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const isAlreadyAccepted = params.status !== 'Pendente';

  async function handleSign() {
    if (!accepted || submitting) return;

    const contractId = Number(params.id);
    if (!contractId) {
      Alert.alert('Erro', 'ID do contrato inválido.');
      return;
    }

    try {
      setSubmitting(true);
      await updateContractStatus(contractId, 'Aceita');
      Alert.alert('Contrato assinado', 'Você aceitou este contrato com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
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
            <Text style={styles.contractBold}>CONTRATANTE:</Text>{' '}
            {params.clienteNome ?? 'Cliente'}
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
            <Text style={styles.contractBold}>CLÁUSULA 2 – PRAZO</Text>
            {'\n'}
            O prazo de vigência deste contrato será de 12 (doze) meses
            {params.data && params.hora
              ? `, com início em ${params.data} às ${params.hora}`
              : ''}
            .
            {'\n\n'}
            <Text style={styles.contractBold}>CLÁUSULA 3 – VALOR E FORMA DE PAGAMENTO</Text>
            {'\n'}
            O CONTRATANTE pagará ao CONTRATADO o valor de{' '}
            <Text style={styles.contractBold}>{precoLabel}</Text>.
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

        {!isAlreadyAccepted && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.7}
              onPress={() => setAccepted((v) => !v)}>
              <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
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
  background: { flex: 1, backgroundColor: colors.muttedSurface },
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
  contractText: {
    fontSize: 13, lineHeight: 20, fontFamily: 'OpenSans_400Regular',
    color: colors.textDark, textAlign: 'justify',
  },
  contractBold: { fontFamily: 'OpenSans_700Bold' },
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
});
