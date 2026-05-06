import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ImageBackground,
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Logo from '../../components/common/Logo';
import InputField from '../../components/auth/InputField';
import AuthButton from '../../components/auth/AuthButton';
import { SpecialtyPickerSheet } from '../../components/SpecialtyPickerSheet';
import colors from '../../utils/colors';
import { isValidEmail, isValidCpf } from '../../utils/validation';
import { loginProvider, registerProvider } from '../../services/authService';
import { Especialidade, fetchEspecialidades } from '../../services/professionalService';

export default function ProviderRegisterScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const [nomeError, setNomeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [senhaError, setSenhaError] = useState('');

  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<number[]>([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);
  const [showSpecialties, setShowSpecialties] = useState(false);

  useEffect(() => {
    fetchEspecialidades()
      .then(setEspecialidades)
      .catch(() => { })
      .finally(() => setLoadingEspecialidades(false));
  }, []);

  function toggleEspecialidade(eid: number) {
    setSelectedEspecialidades((prev) =>
      prev.includes(eid) ? prev.filter((x) => x !== eid) : [...prev, eid]
    );
  }

  function validate(): boolean {
    let valid = true;

    if (!nome.trim()) {
      setNomeError('O nome é obrigatório.');
      valid = false;
    } else {
      setNomeError('');
    }

    if (!email.trim()) {
      setEmailError('O e-mail é obrigatório.');
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Insira um e-mail válido.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!cpf) {
      setCpfError('O CPF é obrigatório.');
      valid = false;
    } else if (cpf.replace(/\D/g, '').length < 11) {
      setCpfError('Digite o CPF completo.');
      valid = false;
    } else if (!isValidCpf(cpf)) {
      setCpfError('CPF inválido.');
      valid = false;
    } else {
      setCpfError('');
    }

    if (!senha) {
      setSenhaError('A senha é obrigatória.');
      valid = false;
    } else if (senha.length < 6) {
      setSenhaError('A senha deve ter pelo menos 6 caracteres.');
      valid = false;
    } else {
      setSenhaError('');
    }

    return valid;
  }

  function applyBackendError(field: string | null | undefined, message: string) {
    const setters: Record<string, (msg: string) => void> = {
      nome: setNomeError,
      email: setEmailError,
      cpf: setCpfError,
      senha: setSenhaError,
    };
    const setter = field ? setters[field] : undefined;
    if (setter) {
      setter(message);
    } else {
      Alert.alert('Erro ao criar conta', message);
    }
  }

  async function handleRegister() {
    if (!validate()) return;

    setLoading(true);
    try {
      await registerProvider({
        nome: nome.trim(),
        email: email.trim(),
        cpf: cpf.replace(/\D/g, ''),
        senha,
        especialidades: selectedEspecialidades.length > 0 ? selectedEspecialidades : undefined,
      });

      Alert.alert(
        'Sucesso',
        'Conta de prestador criada.',
        [
          {
            text: 'Entrar',
            onPress: async () => {
              try {
                const session = await loginProvider({ email: email.trim(), senha });
                await AsyncStorage.setItem('@auth_token', session.accessToken);
                await AsyncStorage.setItem('@auth_user', JSON.stringify(session.user));
                router.replace(`/professional/${session.user.user_id}` as any);
              } catch (loginErr: any) {
                Alert.alert('Erro ao entrar', loginErr?.message ?? 'Faça login manualmente.', [
                  { text: 'OK', onPress: () => router.replace('/auth/provider-login' as any) },
                ]);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      applyBackendError(error?.field, error?.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/fundo_neutro.png')}
      style={styles.background}
    >
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.logoContainer}>
          <Logo />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.subtitle}>Área do Prestador</Text>
              <Text style={styles.title}>Criar Conta</Text>

              <InputField
                placeholder="Nome completo"
                value={nome}
                onChangeText={(text) => {
                  setNome(text);
                  if (nomeError) setNomeError('');
                }}
                autoCapitalize="words"
                errorMessage={nomeError}
              />

              <InputField
                placeholder="E-mail"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                keyboardType="email-address"
                errorMessage={emailError}
              />

              <InputField
                placeholder="CPF (00000000000)"
                value={cpf}
                onChangeText={(text) => {
                  setCpf(text.replace(/\D/g, '').slice(0, 11));
                  if (cpfError) setCpfError('');
                }}
                keyboardType="numeric"
                errorMessage={cpfError}
              />

              <InputField
                placeholder="Senha"
                value={senha}
                onChangeText={(text) => {
                  setSenha(text);
                  if (senhaError) setSenhaError('');
                }}
                isPassword
                errorMessage={senhaError}
              />

              <View style={styles.chipSection}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  activeOpacity={0.7}
                  onPress={() => setShowSpecialties(true)}>
                  <View style={styles.accordionLeft}>
                    <Text style={styles.sectionLabel}>Especialidades</Text>
                    {selectedEspecialidades.length > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {selectedEspecialidades.length} selecionada{selectedEspecialidades.length > 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.chevron}>
                    {selectedEspecialidades.length > 0 ? 'Editar' : 'Selecionar'}
                  </Text>
                </TouchableOpacity>
              </View>

              <AuthButton
                label="Criar conta de prestador"
                onPress={handleRegister}
                loading={loading}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Já tem uma conta? </Text>
                <TouchableOpacity
                  onPress={() => router.replace('/auth/provider-login' as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.footerLink}>Entrar.</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <SpecialtyPickerSheet
        visible={showSpecialties}
        onClose={() => setShowSpecialties(false)}
        especialidades={especialidades}
        selectedIds={selectedEspecialidades}
        onToggle={toggleEspecialidade}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.muttedSurface,
    borderRadius: 24,
    padding: 24,
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginBottom: 20,
    paddingVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'OpenSans_400Regular',
  },
  footerLink: {
    fontSize: 14,
    color: colors.textLink,
    fontFamily: 'OpenSans_700Bold',
  },
  chipSection: {
    marginTop: 4,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  chevron: {
    fontSize: 11,
    color: colors.primary,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textWhite,
  },
  accordionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.primary,
  },
  chipTextSelected: {
    color: colors.textWhite,
  },
  chipEmpty: {
    fontSize: 12,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
