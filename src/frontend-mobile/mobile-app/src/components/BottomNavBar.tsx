import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/colors';
import colors from '../utils/colors';
import { HandyIcon } from './HandyIcon';

interface NavItem {
  icon: string;
  iconActive: string;
  key: string;
  route?: string;
}

const clientNavItems: NavItem[] = [
  { icon: 'home-outline', iconActive: 'home', key: 'home', route: '/home' },
  { icon: 'search-outline', iconActive: 'search', key: 'search' },
  { icon: 'reload-outline', iconActive: 'reload', key: 'history', route: '/contratations' },
  { icon: 'chatbox-ellipses-outline', iconActive: 'chatbox-ellipses', key: 'chat' },
  { icon: 'menu-outline', iconActive: 'menu', key: 'menu' },
];

const providerNavItems: NavItem[] = [
  { icon: 'stats-chart-outline', iconActive: 'stats-chart', key: 'dashboard' },
  { icon: 'people-outline', iconActive: 'people', key: 'clients', route: '/contratations/provider-contracts' },
  { icon: 'reload-outline', iconActive: 'reload', key: 'history', route: '/contratations/provider-contracts' },
  { icon: 'card-outline', iconActive: 'card', key: 'payments' },
  { icon: 'menu-outline', iconActive: 'menu', key: 'menu' },
];

type HandyIconName = 'material-symbols:home-rounded' | 'carbon:for-loop' | 'carbon:chat' | 'hugeicons:menu-11' | 'handy:people' | 'handy:chart' | 'handy:credit-card';

const CLIENT_ICON_MAP: Partial<Record<string, HandyIconName>> = {
  home: 'material-symbols:home-rounded',
  history: 'carbon:for-loop',
  chat: 'carbon:chat',
  menu: 'hugeicons:menu-11',
};

const PROVIDER_ICON_MAP: Partial<Record<string, HandyIconName>> = {
  clients: 'handy:people',
  dashboard: 'handy:chart',
  history: 'carbon:for-loop',
  payments: 'handy:credit-card',
  menu: 'hugeicons:menu-11',
};

interface BottomNavBarProps {
  activeTab?: string;
  variant?: 'client' | 'provider';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = 'home',
  variant = 'client',
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const navItems = variant === 'provider' ? providerNavItems : clientNavItems;
  const iconMap = variant === 'provider' ? PROVIDER_ICON_MAP : CLIENT_ICON_MAP;

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.container}>
        {navItems.map(item => {
          const isActive = item.key === activeTab;
          const iconColor = isActive ? colors.textDark : Colors.navInactive;
          const handyIconName = iconMap[item.key];
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              activeOpacity={0.7}
              onPress={async () => {
                if (item.key === 'dashboard') {
                  try {
                    const userDataStr = await AsyncStorage.getItem('@auth_user');
                    if (userDataStr) {
                      const u = JSON.parse(userDataStr);
                      if (u && u.user_id) {
                        router.push(`/professional/${u.user_id}` as any);
                        return;
                      }
                    }
                  } catch (e) {}
                }
                if (item.route) router.push(item.route as any);
              }}>
              {handyIconName ? (
                <HandyIcon name={handyIconName} size={24} color={iconColor} />
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
    backgroundColor: Colors.white,
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

