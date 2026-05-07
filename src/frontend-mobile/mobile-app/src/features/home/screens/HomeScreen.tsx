import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Header } from '@/shared/components/Header';
import { WelcomeSection } from '@/features/home/components/WelcomeSection';
import { ProfessionalCarousel } from '@/features/professionals/components/ProfessionalCarousel';
import { CategoryGrid } from '@/features/home/components/CategoryGrid';
import { BottomNavBar } from '@/shared/components/BottomNavBar';
import { categories } from '@/features/home/data/mockData';
import { fetchProfessionals, ProfessionalListItem } from '@/features/professionals/services/professionalService';
import { ConcludedContractChecker } from '@/features/contracts/components/ConcludedContractChecker';
import colors from '@/shared/utils/colors';

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('Usuário');
  const [professionals, setProfessionals] = useState<ProfessionalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProvider, setIsProvider] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const userDataString = await AsyncStorage.getItem('@auth_user');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData) {
            const tipo = String(userData.tipo_usuario ?? '').toLowerCase();
            if (tipo === 'prestador' && userData.user_id) {
              setIsProvider(true);
              router.replace(`/professional/${userData.user_id}` as any);
              return;
            }
            if (userData.nome) setUserName(userData.nome);
          }
        }
      } catch (error) {
        console.error("Erro ao ler usuário logado", error);
      }
    }
    loadUser();
  }, [router]);

  useEffect(() => {
    if (isProvider) return;
    let isMounted = true;
    async function loadProfessionals() {
      try {
        setLoading(true);
        const list = await fetchProfessionals();
        if (isMounted) {
          setProfessionals(list);
          setErrorMsg(null);
        }
      } catch (error: any) {
        if (isMounted) setErrorMsg(error?.message ?? 'Erro ao carregar prestadores.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProfessionals();
    return () => {
      isMounted = false;
    };
  }, [isProvider]);

  if (isProvider) {
    return (
      <ImageBackground
        source={require('../../../assets/fundo_neutro.png')}
        style={styles.container}>
        <View style={styles.statusBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../../assets/fundo_neutro.png')}
      style={styles.container}
    >
      <ScrollView
        style={[styles.scrollView, { paddingTop: insets.top }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}>
        <Header />
        <WelcomeSection userName={userName} />
        {loading ? (
          <View style={styles.statusBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : errorMsg ? (
          <View style={styles.statusBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : (
          <ProfessionalCarousel data={professionals} />
        )}
        <CategoryGrid data={categories} />
      </ScrollView>

      <BottomNavBar activeTab="home" />
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
  statusBox: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    fontFamily: 'OpenSans_600SemiBold',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
