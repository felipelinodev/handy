import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { isValidCpf, isValidEmail } from '@/shared/utils/validation';
import { registerClient } from '@/features/auth/services/authService';

export function useRegister() {
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

  async function submit() {
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
        'Sucesso',
        'Conta criada com sucesso. Você já pode fazer o seu login.',
        [{ text: 'Entrar', onPress: () => router.replace({ pathname: '/auth/login' } as any) }]
      );
    } catch (error: any) {
      applyBackendError(error?.field, error?.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return {
    nome,
    email,
    cpf,
    senha,
    loading,
    nomeError,
    emailError,
    cpfError,
    senhaError,
    onChangeNome: (text: string) => {
      setNome(text);
      if (nomeError) setNomeError('');
    },
    onChangeEmail: (text: string) => {
      setEmail(text);
      if (emailError) setEmailError('');
    },
    onChangeCpf: (text: string) => {
      setCpf(text.replace(/\D/g, '').slice(0, 11));
      if (cpfError) setCpfError('');
    },
    onChangeSenha: (text: string) => {
      setSenha(text);
      if (senhaError) setSenhaError('');
    },
    submit,
    goToLogin: () => router.replace({ pathname: '/auth/login' }),
  };
}
