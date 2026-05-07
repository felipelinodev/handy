import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { isValidEmail } from '@/shared/utils/validation';
import { loginProvider } from '@/features/auth/services/authService';

export function useProviderLogin() {
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

  async function submit() {
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

  return {
    email,
    senha,
    loading,
    emailError,
    senhaError,
    onChangeEmail: (text: string) => {
      setEmail(text);
      if (emailError) setEmailError('');
    },
    onChangeSenha: (text: string) => {
      setSenha(text);
      if (senhaError) setSenhaError('');
    },
    submit,
    goToProviderRegister: () => router.push('/auth/provider-register' as any),
    switchToClient: () => router.replace('/auth/login' as any),
  };
}
