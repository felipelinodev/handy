import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../theme/colors';
import {Fonts} from '../theme/fonts';

export const Header: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/Camada_1.png')}
          style={styles.logoIcon}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>Handy</Text>
      </View>
      <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
        <Icon name="notifications-outline" size={22} color={Colors.purpleDark} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 28,
    height: 28,
  },
  logoText: {
    fontSize: 22,
    fontFamily: Fonts.extraBoldItalic,
    color: Colors.purpleDark,
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.notificationBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
