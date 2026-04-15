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

import Logo from '../../components/common/Logo';
import InputField from '../../components/auth/InputField';
import AuthButton from '../../components/auth/AuthButton';
import colors from '../../utils/colors';
import { isValidEmail, isValidCpf } from '../../utils/validation';
import { registerClient } from '../../services/authService';

export default function RegisterScreen() {
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

  async function handleRegister() {
    if (!validate()) return;

    setLoading(true);
    try {
      await registerClient({
        nome: nome.trim(),
        email: email.trim(),
        cpf: cpf.replace(/\D/g, ''),
        senha,
      });

      Alert.alert(
        'Conta criada! 🎉',
        'Cadastro realizado com sucesso. Faça o login para continuar.',
        [{ text: 'Fazer login', onPress: () => router.replace({ pathname: '/auth/login' }) }]
      );
    } catch (error: any) {
      Alert.alert('Erro ao criar conta', error.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../assets/fundo_principal.png')}
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>

          <Logo />

          <View style={styles.card}>
            <Text style={styles.title}>Criar Conta</Text>

            <InputField
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              errorMessage={nomeError}
            />

            <InputField
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              errorMessage={emailError}
            />

            <InputField
              placeholder="CPF (00000000000)"
              value={cpf}
              onChangeText={(text) => {
                setCpf(text.replace(/\D/g, '').slice(0, 11));
                setCpfError('');
              }}
              keyboardType="numeric"
              errorMessage={cpfError}
            />

            <InputField
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              isPassword
              errorMessage={senhaError}
            />

            <AuthButton
              label="Criar conta"
              onPress={handleRegister}
              loading={loading}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta? </Text>
              <TouchableOpacity
                onPress={() => router.replace({ pathname: '/auth/login' })}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Entrar.</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 15,
    color: colors.textDark,
    fontFamily: 'OpenSans_700Bold',
    opacity: 0.7,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginBottom: 20,
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