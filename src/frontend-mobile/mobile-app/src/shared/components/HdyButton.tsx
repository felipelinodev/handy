import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { HandyIcon, IconName } from './HandyIcon';
import colors from '@/theme/colors';

interface HdyButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  iconName?: IconName;
  iconSize?: number;
  iconColor?: string;
  loading?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

export const HdyButton: React.FC<HdyButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  iconName,
  iconSize = 20,
  iconColor,
  loading = false,
  style,
  textStyle,
  disabled,
  ...rest
}) => {
  const isPrimary = variant === 'primary';

  const activeIconColor = iconColor || (isPrimary ? colors.textWhite : colors.primary);

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.textWhite : colors.primary} />
      ) : (
        <>
          <Text
            style={[
              styles.baseText,
              isPrimary ? styles.primaryText : styles.secondaryText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconName && (
            <HandyIcon name={iconName} size={iconSize} color={activeIconColor} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  baseText: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
  },
  primaryText: {
    color: colors.textWhite,
  },
  secondaryText: {
    color: colors.primary,
  },
});
