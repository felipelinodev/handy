import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function Logo() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo_completa.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  logo: {
    width: 120,
    height: 40,
  },
});
