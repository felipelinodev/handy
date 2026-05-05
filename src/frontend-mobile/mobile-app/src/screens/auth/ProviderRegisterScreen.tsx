import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Logo from '../../components/common/Logo';
import InputField from '../../components/auth/InputField';
import AuthButton from '../../components/auth/AuthButton';
import colors from '../../utils/colors';
import { isValidEmail, isValidCpf } from '../../utils/validation';
import { loginProvider, registerProvider } from '../../services/authService';
import {
  Especialidade,
  fetchEspecialidades,
} from '../../services/professionalService';
import { EspecialidadePicker } from '../../components/common/EspecialidadePicker';

export default function ProviderRegisterScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<number[]>([]);

  const [nomeError, setNomeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [especialidadeError, setEspecialidadeError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchEspecialidades()
      .then((list) => {
        if (!cancelled) setEspecialidades(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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

    if (especialidades.length > 0 && selectedEspecialidades.length === 0) {
      setEspecialidadeError('Selecione ao menos uma especialidade.');
      valid = false;
    } else {
      setEspecialidadeError('');
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
        especialidades: selectedEspecialidades,
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

              <Text style={styles.fieldLabel}>Especialidades</Text>
              <EspecialidadePicker
                especialidades={especialidades}
                selectedIds={selectedEspecialidades}
                onChange={(ids) => {
                  setSelectedEspecialidades(ids);
                  if (especialidadeError) setEspecialidadeError('');
                }}
                multi
                placeholder="Selecionar especialidades"
                errorMessage={especialidadeError}
              />

              <View style={{ marginTop: 16 }}>
                <AuthButton
                  label="Criar conta de prestador"
                  onPress={handleRegister}
                  loading={loading}
                />
              </View>

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
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
    marginBottom: 8,
    marginTop: 4,
    marginLeft: 4,
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
});
