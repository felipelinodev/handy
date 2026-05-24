import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/theme/colors';
import {
  AppNotification,
  subscribeToNotifications,
} from '@/features/notifications/services/notificationService';

const VISIBLE_DURATION_MS = 4500;
const HIDDEN_OFFSET = -240;

const STATUS_VISUAL: Record<
  string,
  { icon: keyof typeof Icon.glyphMap; color: string; bg: string }
> = {
  Pendente: { icon: 'time-outline', color: '#A06A00', bg: '#FFF1C2' },
  Aceita: { icon: 'checkmark-circle-outline', color: '#1E40AF', bg: '#D6E4FF' },
  Em_Andamento: {
    icon: 'play-circle-outline',
    color: colors.primary,
    bg: '#E0DDF7',
  },
  'Em Andamento': {
    icon: 'play-circle-outline',
    color: colors.primary,
    bg: '#E0DDF7',
  },
  Concluida: {
    icon: 'checkmark-done-circle-outline',
    color: '#065F46',
    bg: '#D1FAE5',
  },
  'Concluída': {
    icon: 'checkmark-done-circle-outline',
    color: '#065F46',
    bg: '#D1FAE5',
  },
  Cancelada: { icon: 'close-circle-outline', color: '#B91C1C', bg: '#FEE2E2' },
};

export const InAppNotificationToaster: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<AppNotification | null>(null);
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: HIDDEN_OFFSET,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setCurrent(null));
  }, [translateY, opacity]);

  useEffect(() => {
    return subscribeToNotifications((n) => {
      setCurrent(n);
    });
  }, []);

  useEffect(() => {
    if (!current) return;
    if (hideTimer.current) clearTimeout(hideTimer.current);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
        speed: 14,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    hideTimer.current = setTimeout(() => {
      hide();
    }, VISIBLE_DURATION_MS);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [current, translateY, opacity, hide]);

  function handlePress() {
    hide();
    router.push('/notifications' as any);
  }

  if (!current) return null;

  const visual =
    STATUS_VISUAL[current.status] ?? {
      icon: 'notifications' as const,
      color: colors.primary,
      bg: '#E0DDF7',
    };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + 8,
          transform: [{ translateY }],
          opacity,
        },
      ]}>
      <Pressable
        onPress={handlePress}
        android_ripple={{ color: 'rgba(91,103,237,0.08)' }}
        style={styles.toast}>
        <View style={[styles.iconWrap, { backgroundColor: visual.bg }]}>
          <Icon name={visual.icon} size={20} color={visual.color} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Atualização do contrato</Text>
          <Text style={styles.message} numberOfLines={2}>
            {current.message}
          </Text>
        </View>
        <Pressable
          hitSlop={10}
          onPress={hide}
          style={styles.closeBtn}>
          <Icon name="close" size={16} color={colors.textMuted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    zIndex: 9999,
    elevation: 30,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 11,
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
