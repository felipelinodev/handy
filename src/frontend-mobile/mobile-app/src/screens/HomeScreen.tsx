import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Header } from '../components/Header';
import { WelcomeSection } from '../components/WelcomeSection';
import { ProfessionalCarousel } from '../components/ProfessionalCarousel';
import { CategoryGrid } from '../components/CategoryGrid';
import { BottomNavBar } from '../components/BottomNavBar';
import { ConcludedContractChecker } from '../components/ConcludedContractChecker';
import { professionals, categories } from '../data/mockData';

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('Usuário');

  useEffect(() => {
    async function loadUser() {
      try {
        const userDataString = await AsyncStorage.getItem('@auth_user');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData?.nome) setUserName(userData.nome);
        }
      } catch (error) {
        console.error('Erro ao ler usuário logado', error);
      }
    }
    loadUser();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/fundo_principal.png')}
      style={styles.container}
    >
      <ScrollView
        style={[styles.scrollView, { paddingTop: insets.top }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Header />
        <WelcomeSection userName={userName} />
        <ProfessionalCarousel data={professionals} />
        <CategoryGrid data={categories} />
      </ScrollView>

      <BottomNavBar activeTab="home" />

      {/* Verifica automaticamente contratos concluídos e exibe o modal de avaliação */}
      <ConcludedContractChecker />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});
