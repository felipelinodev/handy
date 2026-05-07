import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';

import colors from '@/theme/colors';
import { getUnreadCount } from '@/features/notifications/services/notificationService';

interface NotificationBellProps {
  size?: number;
  iconColor?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  size = 22,
  iconColor = colors.primary,
}) => {
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function refresh() {
        const count = await getUnreadCount();
        if (active) setUnread(count);
      }
      refresh();
      const interval = setInterval(refresh, 5000);
      return () => {
        active = false;
        clearInterval(interval);
      };
    }, []),
  );

  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.7}
      onPress={() => router.push('/notifications' as any)}>
      <Icon name="notifications-outline" size={size} color={iconColor} />
      {unread > 0 && <View style={styles.dot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  dot: {
    position: 'absolute',
    top: 11,
    right: 13,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: '#FAF5FF',
  },
});
