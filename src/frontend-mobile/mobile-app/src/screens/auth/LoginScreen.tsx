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
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Logo from '../../components/common/Logo';
import InputField from '../../components/auth/InputField';
import AuthButton from '../../components/auth/AuthButton';
import colors from '../../utils/colors';
import { isValidEmail } from '../../utils/validation';
import { loginClient } from '../../services/authService';

export default function LoginScreen() {
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
      const response = await loginClient({ email: email.trim(), senha });

      await AsyncStorage.setItem('@auth_token', response.accessToken);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(response.user));

      Alert.alert('Sucesso!', `Bem-vindo(a), ${response.user.nome}!`);
      router.replace('/home' as any);
    } catch (error: any) {
      Alert.alert('Erro ao entrar', error.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/fundo_principal.png')}
      style={styles.background}
    >
      <View style={styles.logoContainer}>
        <Logo />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Entrar</Text>

            <InputField
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              errorMessage={emailError}
            />

            <InputField
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              isPassword
              errorMessage={senhaError}
            />

            <AuthButton
              label="Entrar"
              onPress={handleLogin}
              loading={loading}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem uma conta? </Text>
              <TouchableOpacity
                onPress={() => router.push('/auth/register' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Crie sua conta.</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: 32,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.muttedSurface,
    borderRadius: 24,
    padding: 24,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    fontFamily: 'OpenSans_400Regular',
    fontSize: 24
  },
  title: {
    fontSize: 26,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginBottom: 20,
    paddingVertical: 20
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
