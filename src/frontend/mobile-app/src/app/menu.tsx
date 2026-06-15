import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomNavBar } from '@/shared/components/BottomNavBar';

interface MenuItemProps {
  label: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, onPress }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.menuItemLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
  </TouchableOpacity>
);

export default function ClientMenuScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['@auth_token', '@auth_user']);
      router.replace('/' as any);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const menuOptions = [
    { label: 'Meus Contratos', action: () => router.push('/contratations' as any) },
    { label: 'Notificações', action: () => router.push('/notifications' as any) },
    { label: 'Dados da Conta', action: () => { } },
    { label: 'Suporte', action: () => { } },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E5D9F2', '#A5B4FC', '#6366F1']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: 120 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={colors.textDark} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/notifications' as any)}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Menu</Text>

          <View style={styles.menuContainer}>
            {menuOptions.map((option, index) => (
              <MenuItem
                key={index}
                label={option.label}
                onPress={option.action}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      <BottomNavBar activeTab="menu" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
    marginBottom: 32,
  },
  menuContainer: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: '#FFFFFF',
  },
});
