import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/theme/colors';
import { HandyIcon } from '@/shared/components/HandyIcon';

interface NavItem {
  icon: string;
  iconActive: string;
  key: string;
  route?: string;
}

const navItems: NavItem[] = [
  { icon: 'home-outline', iconActive: 'home', key: 'home', route: '/home' },
  { icon: 'search-outline', iconActive: 'search', key: 'search', route: '/search' },
  { icon: 'reload-outline', iconActive: 'reload', key: 'history', route: '/contratations' },
  { icon: 'chatbox-ellipses-outline', iconActive: 'chatbox-ellipses', key: 'chat' },
  { icon: 'menu-outline', iconActive: 'menu', key: 'menu' },
];

interface BottomNavBarProps {
  activeTab?: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = 'home',
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.container}>
        {navItems.map(item => {
          const isActive = item.key === activeTab;
          const iconColor = isActive ? colors.textDark : colors.navInactive;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              activeOpacity={0.7}
              onPress={() => {
                if (item.route) router.push(item.route as any);
              }}>
              {item.key === 'home' ? (
                <HandyIcon name="material-symbols:home-rounded" size={24} color={iconColor} />
              ) : item.key === 'history' ? (
                <HandyIcon name="carbon:for-loop" size={24} color={iconColor} />
              ) : item.key === 'chat' ? (
                <HandyIcon name="carbon:chat" size={24} color={iconColor} />
              ) : item.key === 'menu' ? (
                <HandyIcon name="hugeicons:menu-11" size={24} color={iconColor} />
              ) : (
                <Icon
                  name={(isActive ? item.iconActive : item.icon) as any}
                  size={24}
                  color={iconColor}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 100,
    elevation: 20,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 10,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
    height: 65,
    borderRadius: 14,
  },
  navItemActive: {
    backgroundColor: colors.muttedSurface,
  },
});
