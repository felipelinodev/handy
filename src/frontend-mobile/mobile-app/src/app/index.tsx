import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../assets/fundo_principal.png')}
      style={styles.container}
    >
      {/* PARTE DE CIMA - LOGO  */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo_completa.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* PARTE DE BAIXO - TEXTO E BOTÕES */}
      <View style={styles.contentContainer}>
        <Text style={styles.textTitle}>Para te orientar no App</Text>

        <Text style={styles.textSubtitle}>
          você quer prestar serviços ou contratar prestadores?
        </Text>

        <View style={styles.buttonGroup}>
          {/* Navega para o fluxo de login do cliente */}
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.buttonText}>Serviços</Text>
          </TouchableOpacity>

          {/* Área do prestador ainda não implementada */}
          <TouchableOpacity
            style={styles.buttonSegundary}
            onPress={() => Alert.alert('Em breve', 'Área do prestador em desenvolvimento.')}
          >
            <Text style={styles.buttonText}>Prestar Serviços</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logo: {
    width: 131.51,
  },
  contentContainer: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans_700Bold',
    color: '#6366f1',
    textAlign: 'center',
    marginBottom: 10,
  },
  textSubtitle: {
    fontSize: 16,
    fontFamily: 'OpenSans_400Regular',
    color: '#121341',
    textAlign: 'center',
    width: 280,
    marginBottom: 40,
  },
  buttonGroup: {
    gap: 13,
    width: '100%',
    alignItems: 'center',
  },
  buttonPrimary: {
    width: 309,
    height: 60,
    backgroundColor: '#6366f1',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSegundary: {
    width: 309,
    height: 60,
    backgroundColor: '#0f172a',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
    color: '#fff',
  },
});
