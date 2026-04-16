import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Header} from '../components/Header';
import {WelcomeSection} from '../components/WelcomeSection';
import {ProfessionalCarousel} from '../components/ProfessionalCarousel';
import {CategoryGrid} from '../components/CategoryGrid';
import {BottomNavBar} from '../components/BottomNavBar';
import {professionals, categories} from '../data/mockData';
import {Colors} from '../theme/colors';

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradientTop, Colors.gradientMiddle, Colors.gradientBottom]}
        locations={[0, 0.55, 1]}
        style={styles.gradient}>
        <ScrollView
          style={[styles.scrollView, {paddingTop: insets.top}]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}>
          <Header />
          <WelcomeSection userName="Felipe" />
          <ProfessionalCarousel data={professionals} />
          <CategoryGrid data={categories} />
        </ScrollView>
      </LinearGradient>

      <BottomNavBar activeTab="home" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});
