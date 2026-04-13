import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

import { useFonts } from 'expo-font';

import {
  OpenSans_400Regular,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CAROUSEL_WIDTH = SCREEN_WIDTH * 0.78;
const CAROUSEL_HEIGHT = CAROUSEL_WIDTH * 0.58;

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({ OpenSans_400Regular, OpenSans_700Bold });

  if (!fontsLoaded) return null; //IMPEDE O SISTEMA DE CARREGAR TELAS SEM AS FONTES DESEJADAS. EVITA CARREGAR FONTES RIDÍCULAS DO SISTEMAS.

  return (
    <ImageBackground
      source={require('../assets/fundo_tela_boasvindas.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* PARTE DE CIMA - LOGO */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logo_completa.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* IMAGEM FIXA */}
      <View style={styles.carouselContainer}>
        <View style={styles.carouselItem}>
          <Image
            source={require('../assets/people1.png')}
            style={styles.carouselImage}
            resizeMode="cover"
          />
        </View>

        {/* INDICADOR FIXO */}
        <View style={styles.indicatorContainer}>
          <View style={styles.indicatorActive} />
        </View>
      </View>

      {/* PARTE DE BAIXO - TEXTO E BOTÕES */}
      <View style={styles.contentContainer}>
        <Text style={styles.mainText}>
          Conectamos prestadores{'\n'}de serviços e clientes de forma{'\n'}
          <Text style={styles.highlightText}>eficiente e segura</Text>.
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.buttonSegundary}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Não tem uma conta?{' '}
            <Text style={styles.footerLink}>Crie sua conta.</Text>
          </Text>
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
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 20,
  },
  logo: {
    width: 131.51,
    height: 50,
  },
  carouselContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  carouselItem: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  indicatorActive: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 50,
    paddingTop: 20,
  },
  mainText: {
    fontSize: 24,
    fontFamily: 'OpenSans_700Bold',
    color: '#121341',
    lineHeight: 34,
  },
  highlightText: {
    color: '#6366f1',
    textDecorationLine: 'underline',
  },
  buttonGroup: {
    alignItems: 'center',
    gap: 16,
  },
  buttonSegundary: {
    width: 309,
    height: 60,
    backgroundColor: '#6366f1',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
    color: '#fff',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
    color: '#121341',
  },
  footerLink: {
    fontFamily: 'OpenSans_700Bold',
    color: '#121341',
    textDecorationLine: 'underline',
  },
});
