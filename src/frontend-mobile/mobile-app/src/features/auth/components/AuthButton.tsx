import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import colors from '@/shared/utils/colors';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
}

export default function AuthButton({
  label,
  onPress,
  loading = false,
  style,
}: AuthButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style, loading && styles.buttonDisabled]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.textWhite} size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.buttonDark,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  label: {
    color: colors.textWhite,
    fontSize: 17,
    fontFamily: 'OpenSans_700Bold',
    letterSpacing: 0.3,
  },
});
