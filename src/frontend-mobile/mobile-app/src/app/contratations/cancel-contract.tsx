import React, { useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Icon from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/theme/colors';
import { BottomNavBar } from '@/shared/components/BottomNavBar';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';

const PROFILE_PLACEHOLDER = require('../../../assets/images/fundo_neutro.png');

type Params = {
  contratoId?: string;
  prestadorNome?: string;
  prestadorFoto?: string;
  prestadorCategoria?: string;
  prestadorRating?: string;
  prestadorClientes?: string;
};

export default function CancelContractScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();

  const [motivo, setMotivo] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [motivoFocus, setMotivoFocus] = useState(false);
  const [detalhesFocus, setDetalhesFocus] = useState(false);

  function handleSubmit() {
    if (!motivo.trim()) {
      Alert.alert(
        'Motivo obrigatório',
        'Informe o motivo do cancelamento antes de solicitar.',
      );
      return;
    }
    setSubmitting(true);
    try {
      router.push({
        pathname: '/contratations/cancel-contract-policy',
        params: {
          contratoId: params.contratoId,
          motivo: motivo.trim(),
          detalhes: detalhes.trim(),
          prestadorNome: params.prestadorNome,
          prestadorFoto: params.prestadorFoto,
          prestadorCategoria: params.prestadorCategoria,
          prestadorRating: params.prestadorRating,
          prestadorClientes: params.prestadorClientes,
        },
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/fundo_neutro_clean.png')}
      style={styles.background}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.handle} />

            <Text style={styles.title}>Solicitar Cancelamento</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Motivo</Text>
              <TextInput
                style={[styles.input, motivoFocus && styles.inputFocused]}
                placeholder="Fale o motivo do cancelamento"
                placeholderTextColor={colors.textMuted}
                value={motivo}
                onChangeText={setMotivo}
                onFocus={() => setMotivoFocus(true)}
                onBlur={() => setMotivoFocus(false)}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Detalhes</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textarea,
                  detalhesFocus && styles.inputFocused,
                ]}
                placeholder="Forneça mais detalhes, para podermos compreender sua situação."
                placeholderTextColor={colors.textMuted}
                value={detalhes}
                onChangeText={setDetalhes}
                onFocus={() => setDetalhesFocus(true)}
                onBlur={() => setDetalhesFocus(false)}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.8}
                onPress={() => router.back()}>
                <Text style={styles.cancelBtnText}>Desistir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                activeOpacity={0.85}
                disabled={submitting}
                onPress={handleSubmit}>
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Enviando...' : 'Solicitar'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

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
    marginBottom: 22,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.surfaceInput,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
  },
  inputFocused: {
    borderColor: colors.borderFocus,
    backgroundColor: colors.surface,
  },
  textarea: {
    minHeight: 130,
    paddingTop: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#E2DEF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.buttonDark,
  },
  submitBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textWhite,
  },
});
