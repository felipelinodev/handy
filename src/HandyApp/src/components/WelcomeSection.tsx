import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';
import {Fonts} from '../theme/fonts';

interface WelcomeSectionProps {
  userName: string;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({userName}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Olá, {userName}!</Text>
      <Text style={styles.subtitle}>Encontre o serviço que deseja.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontFamily: Fonts.boldItalic,
    color: Colors.purpleDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
});
