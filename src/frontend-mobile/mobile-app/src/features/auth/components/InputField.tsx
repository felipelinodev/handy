import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/theme/colors';

interface InputFieldProps extends TextInputProps {
  placeholder: string;
  isPassword?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  errorMessage?: string;
}

export default function InputField({
  placeholder,
  isPassword = false,
  value,
  onChangeText,
  errorMessage,
  ...rest
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          !!errorMessage && styles.containerError,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceInput,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  containerFocused: {
    borderColor: colors.borderFocus,
    backgroundColor: colors.surface,
  },
  containerError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textDark,
    fontFamily: 'OpenSans_400Regular',
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    color: colors.error,
    fontFamily: 'OpenSans_400Regular',
  },
});
