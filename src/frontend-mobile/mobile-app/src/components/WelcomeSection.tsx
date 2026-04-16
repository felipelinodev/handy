import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import colors from '../utils/colors';

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
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
    lineHeight: 22,
  },
});
