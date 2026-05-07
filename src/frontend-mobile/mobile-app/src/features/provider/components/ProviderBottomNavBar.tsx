import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/theme/colors';
import { HandyIcon } from '@/shared/components/HandyIcon';

type ProviderTab = 'clients' | 'analytics' | 'contracts' | 'payments' | 'menu';

interface NavItem {
  key: ProviderTab;
  icon: React.ComponentProps<typeof HandyIcon>['name'];
  route?: string;
}

const navItems: NavItem[] = [
  { key: 'clients',   icon: 'hugeicons:user-group',  route: '/contratations/provider-contracts' },
  { key: 'analytics', icon: 'solar:chart-square' },
  { key: 'contracts', icon: 'carbon:for-loop',        route: '/contratations/provider-contracts' },
  { key: 'payments',  icon: 'hugeicons:credit-card' },
  { key: 'menu',      icon: 'hugeicons:menu-11' },
];

interface ProviderBottomNavBarProps {
  activeTab?: ProviderTab;
}

export const ProviderBottomNavBar: React.FC<ProviderBottomNavBarProps> = ({
  activeTab = 'menu',
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.container}>
        {navItems.map((item) => {
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
              <HandyIcon name={item.icon} size={24} color={iconColor} />
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
