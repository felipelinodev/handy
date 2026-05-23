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
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, exchangeCodeAsync } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  console.log('🔗 REDIRECT URI GERADA:', redirectUri);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_ZITADEL_CLIENT_ID || '',
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      redirectUri,
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
          redirectUri: makeRedirectUri({ scheme: 'handyapp', path: 'callback' }),
          extraParams: {
            code_verifier: request?.codeVerifier,
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

          // Salva os dados no AsyncStorage do celular igualzinho o login normal faz
          await AsyncStorage.setItem('@auth_token', res.accessToken);
          await AsyncStorage.setItem('@auth_user', JSON.stringify({
            nome: userInfo.given_name || userInfo.name || 'Usuário',
            email: userInfo.email,
            zitadel_id: userInfo.sub
          }));

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

              <AuthButton label="Entrar" onPress={submit} loading={loading} />

              <AuthButton 
                label="Entrar com ZITADEL" 
                onPress={() => promptAsync()} 
                style={{ backgroundColor: '#2b2d42', marginTop: 12 }} 
              />

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
