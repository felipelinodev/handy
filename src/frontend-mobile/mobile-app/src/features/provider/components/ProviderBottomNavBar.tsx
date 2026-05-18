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
  { key: 'analytics', icon: 'solar:chart-square', route: '/provider/analytics' },
  { key: 'clients', icon: 'hugeicons:user-group', route: '/provider/clients' },
  { key: 'contracts', icon: 'carbon:for-loop', route: '/contratations/provider-contracts' },
  { key: 'payments', icon: 'hugeicons:credit-card', route: '/provider/payments' },
  { key: 'menu', icon: 'hugeicons:menu-11', route: '/provider/menu' },
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
                console.log('Navigating to:', item.route);
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
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
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
