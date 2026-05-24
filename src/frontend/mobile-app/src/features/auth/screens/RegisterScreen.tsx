import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Logo from '@/shared/components/Logo';
import InputField from '@/features/auth/components/InputField';
import AuthButton from '@/features/auth/components/AuthButton';
import { useRegister } from '@/features/auth/hooks/useRegister';

import { styles } from './RegisterScreen.styles';

export default function RegisterScreen() {
  const {
    nome,
    email,
    cpf,
    senha,
    loading,
    nomeError,
    emailError,
    cpfError,
    senhaError,
    onChangeNome,
    onChangeEmail,
    onChangeCpf,
    onChangeSenha,
    submit,
    goToLogin,
  } = useRegister();

  return (
    <ImageBackground
      source={require('../../../../assets/images/fundo_neutro.png')}
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
              <Text style={styles.title}>Criar Conta</Text>

              <InputField
                placeholder="Nome completo"
                value={nome}
                onChangeText={onChangeNome}
                autoCapitalize="words"
                errorMessage={nomeError}
              />

              <InputField
                placeholder="E-mail"
                value={email}
                onChangeText={onChangeEmail}
                keyboardType="email-address"
                errorMessage={emailError}
              />

              <InputField
                placeholder="CPF (00000000000)"
                value={cpf}
                onChangeText={onChangeCpf}
                keyboardType="numeric"
                errorMessage={cpfError}
              />

              <InputField
                placeholder="Senha"
                value={senha}
                onChangeText={onChangeSenha}
                isPassword
                errorMessage={senhaError}
              />

              <AuthButton label="Criar conta" onPress={submit} loading={loading} />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={goToLogin} activeOpacity={0.7}>
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
