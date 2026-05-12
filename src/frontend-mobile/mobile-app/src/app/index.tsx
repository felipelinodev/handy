import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { HdyButton } from '../shared/components/HdyButton';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import { useFonts } from 'expo-font';

import {
  OpenSans_400Regular,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CAROUSEL_WIDTH = SCREEN_WIDTH * 0.82;
const CAROUSEL_HEIGHT = CAROUSEL_WIDTH * 0.58;

const CAROUSEL_IMAGES = [
  require('../../assets/images/people1.jpg'),
  require('../../assets/images/people2.jpg'),
  require('../../assets/images/people3.jpg'),
  require('../../assets/images/people4.jpg'),
  require('../../assets/images/people5.jpg'),
  require('../../assets/images/people6.jpg'),
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ OpenSans_400Regular, OpenSans_700Bold });
  const [activeIndex, setActiveIndex] = useState(0);

  if (!fontsLoaded) return null; //IMPEDE O SISTEMA DE CARREGAR TELAS SEM AS FONTES DESEJADAS

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIndex) {
      setActiveIndex(roundIndex);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/fundo_tela_boasvindas.png')}
      style={styles.container}
      resizeMode="cover" //PREENCHIMENTO TOTAL, PROPORÇÃO E RECORTE.
    >
      {/* PARTE DE CIMA - LOGO */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo_completa.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* CARROSSEL DE IMAGENS FUNCIONAL */}
      <View style={styles.carouselContainer}>
        <FlatList
          data={CAROUSEL_IMAGES}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          renderItem={({ item }) => (
            <View style={styles.carouselSlide}>
              <View style={styles.carouselItem}>
                <Image
                  source={item}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          )}
        />

        {/* INDICADOR DINÂMICO */}
        <View style={styles.indicatorContainer}>
          {CAROUSEL_IMAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorInactive,
                activeIndex === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* PARTE DE BAIXO - TEXTO E BOTÕES */}
      <View style={styles.contentContainer}>
        <Text style={styles.mainText}>
          Conectamos prestadores{'\n'}de serviços e clientes de forma{'\n'}
          <Text style={styles.highlightText}>eficiente e segura</Text>.
        </Text>

        <View style={styles.buttonGroup}>
          <HdyButton
            title="Entrar"
            onPress={() => router.push('/decide' as any)}
            style={{ width: 309, height: 60 }}
          />

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Não tem uma conta? </Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/register' as any)}
              activeOpacity={0.7}>
              <Text style={styles.footerLink}>Crie sua conta.</Text>
            </TouchableOpacity>
          </View>
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
  carouselSlide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
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
  indicatorInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
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

  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
    color: '#121341',
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: '#121341',
    textDecorationLine: 'underline',
  },
});
