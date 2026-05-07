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
import { useProviderLogin } from '@/features/auth/hooks/useProviderLogin';

import { styles } from './ProviderLoginScreen.styles';

export default function ProviderLoginScreen() {
  const {
    email,
    senha,
    loading,
    emailError,
    senhaError,
    onChangeEmail,
    onChangeSenha,
    submit,
    goToProviderRegister,
    switchToClient,
  } = useProviderLogin();

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
              <Text style={styles.subtitle}>Área do Prestador</Text>
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

              <AuthButton
                label="Entrar como Prestador"
                onPress={submit}
                loading={loading}
              />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Ainda não é prestador? </Text>
                <TouchableOpacity onPress={goToProviderRegister} activeOpacity={0.7}>
                  <Text style={styles.footerLink}>Cadastre-se.</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity onPress={switchToClient} activeOpacity={0.7}>
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
