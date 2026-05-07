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
import { useLogin } from '@/features/auth/hooks/useLogin';

import { styles } from './LoginScreen.styles';

export default function LoginScreen() {
  const {
    email,
    senha,
    loading,
    emailError,
    senhaError,
    onChangeEmail,
    onChangeSenha,
    submit,
    goToRegister,
    switchToProvider,
  } = useLogin();

  return (
    <ImageBackground
      source={require('../../../assets/fundo_neutro.png')}
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
              <Text style={styles.title}>Entrar</Text>

              <InputField
                placeholder="E-mail"
                value={email}
                onChangeText={onChangeEmail}
                keyboardType="email-address"
                errorMessage={emailError}
              />

              <InputField
                placeholder="Senha"
                value={senha}
                onChangeText={onChangeSenha}
                isPassword
                errorMessage={senhaError}
              />

              <AuthButton label="Entrar" onPress={submit} loading={loading} />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Não tem uma conta? </Text>
                <TouchableOpacity onPress={goToRegister} activeOpacity={0.7}>
                  <Text style={styles.footerLink}>Crie sua conta.</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity onPress={switchToProvider} activeOpacity={0.7}>
                  <Text style={styles.altLink}>Sou prestador</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
