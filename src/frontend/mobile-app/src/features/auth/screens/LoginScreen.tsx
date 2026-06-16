import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, exchangeCodeAsync } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, getPublicHeaders } from '@/services/apiConfig';

WebBrowser.maybeCompleteAuthSession();



const discovery = {
  authorizationEndpoint: `${process.env.EXPO_PUBLIC_ZITADEL_ISSUER}/oauth/v2/authorize`,
  tokenEndpoint: `${process.env.EXPO_PUBLIC_ZITADEL_ISSUER}/oauth/v2/token`,
  revocationEndpoint: `${process.env.EXPO_PUBLIC_ZITADEL_ISSUER}/oauth/v2/revoke`,
};

import Logo from '@/shared/components/Logo';
import InputField from '@/features/auth/components/InputField';
import AuthButton from '@/features/auth/components/AuthButton';
import { useLogin } from '@/features/auth/hooks/useLogin';

import { styles } from './LoginScreen.styles';
import colors from '@/theme/colors';

export default function LoginScreen() {
  const router = useRouter();

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



  const redirectUri = makeRedirectUri({
    scheme: 'handyapp',
    path: 'callback'
  });

  console.log('========================================');
  console.log('🔗 REDIRECT URI GERADA:', redirectUri);
  console.log('⚠️  Certifique-se de que este URI está cadastrado no ZITADEL!');
  console.log('========================================');

  const googleIdpId = process.env.EXPO_PUBLIC_ZITADEL_GOOGLE_IDP_ID || '';
  const scopes = ['openid', 'profile', 'email', 'offline_access'];
  if (googleIdpId) {
    scopes.push(`urn:zitadel:iam:org:idp:id:${googleIdpId}`);
  }

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_ZITADEL_CLIENT_ID || '',
      scopes,
      redirectUri,
      extraParams: {
        prompt: 'select_account',
      },
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;

      exchangeCodeAsync(
        {
          clientId: process.env.EXPO_PUBLIC_ZITADEL_CLIENT_ID || '',
          code,
          redirectUri,
          extraParams: {
            code_verifier: request?.codeVerifier!,
          },
        },
        discovery
      )
        .then(async (res) => {
          console.log("🎉 Tokens ZITADEL recebidos:", res);

          // Buscar informações do usuário logado no ZITADEL
          const userInfoResponse = await fetch(`${process.env.EXPO_PUBLIC_ZITADEL_ISSUER}/oidc/v1/userinfo`, {
            headers: { Authorization: `Bearer ${res.accessToken}` }
          });
          const userInfo = await userInfoResponse.json();

          // Trocar o token Zitadel por um token JWT local do backend
          const headers = await getPublicHeaders();
          const backendResponse = await fetch(`${BASE_URL}/client/login-zitadel`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              email: userInfo.email,
              nome: userInfo.given_name || userInfo.name || 'Usuário',
              zitadel_id: userInfo.sub,
            }),
          });

          if (!backendResponse.ok) {
            const errData = await backendResponse.json().catch(() => ({}));
            throw new Error(errData?.message || `Erro do backend: ${backendResponse.status}`);
          }

          const backendData = await backendResponse.json();

          // Salva o token JWT LOCAL do backend (não o do Zitadel!)
          await AsyncStorage.setItem('@auth_token', backendData.accessToken);
          await AsyncStorage.setItem('@auth_user', JSON.stringify(backendData.user));

          // Manda pra tela principal!
          router.replace('/home' as any);
        })
        .catch((error) => {
          console.error("Erro no ZITADEL:", error);
          alert("Erro no login ZITADEL: " + error.message);
        });
    }
  }, [response]);

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

              <TouchableOpacity
                onPress={() => router.push('/auth/forgot-password' as any)}
                style={styles.forgotPasswordContainer}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordLink}>Esqueci minha senha</Text>
              </TouchableOpacity>

              <AuthButton label="Entrar" onPress={submit} loading={loading} />

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  height: 54,
                  width: '100%',
                  marginTop: 12,
                  borderWidth: 1,
                  borderColor: '#dadce0',
                }}
                onPress={() => promptAsync()}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                  style={{ width: 22, height: 22, marginRight: 10 }}
                />
                <Text style={{
                  color: '#3c4043',
                  fontSize: 16,
                  fontFamily: 'OpenSans_600SemiBold',
                  letterSpacing: 0.2,
                }}>Entrar com Google</Text>
              </TouchableOpacity>

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
