import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import colors from '@/theme/colors';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';

type Props = {
  onBack?: () => void;
};

export function ScreenTopBar({ onBack }: Props) {
  const router = useRouter();
  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={styles.iconButton}
        activeOpacity={0.7}
        onPress={onBack ?? (() => router.back())}>
        <Icon name="chevron-back" size={22} color={colors.primary} />
      </TouchableOpacity>
      <NotificationBell />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
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
});
