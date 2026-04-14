import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../theme/colors';

interface NavItem {
  icon: string;
  iconActive: string;
  key: string;
}

const navItems: NavItem[] = [
  {icon: 'home-outline', iconActive: 'home', key: 'home'},
  {icon: 'search-outline', iconActive: 'search', key: 'search'},
  {icon: 'reload-outline', iconActive: 'reload', key: 'history'},
  {icon: 'chatbubble-ellipses-outline', iconActive: 'chatbubble-ellipses', key: 'chat'},
  {icon: 'menu-outline', iconActive: 'menu', key: 'menu'},
];

interface BottomNavBarProps {
  activeTab?: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = 'home',
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {navItems.map(item => {
          const isActive = item.key === activeTab;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              activeOpacity={0.7}>
              <Icon
                name={isActive ? item.iconActive : item.icon}
                size={24}
                color={isActive ? Colors.navActive : Colors.navInactive}
              />
              {isActive && <View style={styles.activeIndicator} />}
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
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 32,
    paddingVertical: 14,
    paddingHorizontal: 10,
    shadowColor: '#4A1D96',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.navActive,
    marginTop: 4,
  },
});
