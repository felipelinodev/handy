import React, { useState } from 'react';
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
import { isValidEmail } from '../../utils/validation';
import { loginProvider } from '../../services/authService';

export default function ProviderLoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');

  function validate(): boolean {
    let valid = true;

    if (!email.trim()) {
      setEmailError('O e-mail é obrigatório.');
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Insira um e-mail válido.');
      valid = false;
    } else {
      setEmailError('');
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

  async function handleLogin() {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await loginProvider({ email: email.trim(), senha });

      await AsyncStorage.setItem('@auth_token', response.accessToken);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(response.user));

      Alert.alert('Sucesso!', `Bem-vindo(a), ${response.user.nome}!`);
      router.replace(`/professional/${response.user.user_id}` as any);
    } catch (error: any) {
      const setters: Record<string, (msg: string) => void> = {
        email: setEmailError,
        senha: setSenhaError,
      };
      const setter = error?.field ? setters[error.field] : undefined;
      if (setter) {
        setter(error.message);
      } else {
        Alert.alert('Erro ao entrar', error?.message ?? 'Tente novamente.');
      }
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
              <Text style={styles.title}>Entrar</Text>

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
                placeholder="Senha"
                value={senha}
                onChangeText={(text) => {
                  setSenha(text);
                  if (senhaError) setSenhaError('');
                }}
                isPassword
                errorMessage={senhaError}
              />

              <AuthButton
                label="Entrar como Prestador"
                onPress={handleLogin}
                loading={loading}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Ainda não é prestador? </Text>
                <TouchableOpacity
                  onPress={() => router.push('/auth/provider-register' as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.footerLink}>Cadastre-se.</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={() => router.replace('/auth/login' as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.altLink}>Sou cliente</Text>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
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
  altLink: {
    fontSize: 13,
    color: colors.primary,
    fontFamily: 'OpenSans_600SemiBold',
  },
});
