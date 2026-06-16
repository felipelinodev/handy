import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Logo from '@/shared/components/Logo';
import InputField from '@/features/auth/components/InputField';
import AuthButton from '@/features/auth/components/AuthButton';
import colors from '@/theme/colors';

import { styles } from './ForgotPasswordScreen.styles';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setEmailError('O e-mail é obrigatório.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Por favor, insira um e-mail válido.');
      return;
    }

    setEmailError('');
    setLoading(true);
    setSuccess(false);
    setErrorMsg('');

    // Placeholder: simula envio enquanto o backend não tem endpoint de reset
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);
    setEmail('');
  };

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
              <Text style={styles.title}>Recuperar Senha</Text>
              
              <Text style={styles.description}>
                Insira o seu e-mail cadastrado e enviaremos um link com instruções para redefinição de senha.
              </Text>

              {!!errorMsg && (
                <View style={[styles.alertBanner, styles.alertBannerError]}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                  <Text style={[styles.alertText, styles.alertTextError]}>
                    {errorMsg}
                  </Text>
                </View>
              )}

              {success && (
                <View style={[styles.alertBanner, styles.alertBannerSuccess]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.alertText, styles.alertTextSuccess]}>
                    Instruções enviadas com sucesso para o seu e-mail!
                  </Text>
                </View>
              )}

              <InputField
                placeholder="E-mail"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                keyboardType="email-address"
                errorMessage={emailError}
                editable={!loading}
              />

              <View style={styles.buttonsContainer}>
                <AuthButton
                  label="Enviar"
                  onPress={handleSubmit}
                  loading={loading}
                />

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => router.back()}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Voltar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
