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
import { ProviderBottomNavBar } from '@/features/provider/components/ProviderBottomNavBar';

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

export default function ProviderMenuScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const menuOptions = [
    {
      label: 'Perfil',
      action: async () => {
        try {
          const userData = await AsyncStorage.getItem('@auth_user');
          console.log('User data from storage:', userData);
          if (userData) {
            const user = JSON.parse(userData);
            const profileId = user.user_id || user.id || user.provider_id;
            console.log('Navigating to profile with ID:', profileId);
            if (profileId) {
              router.push(`/professional/${profileId}` as any);
            } else {
              console.warn('No ID found in user data');
            }
          } else {
            console.warn('No user data found in storage');
          }
        } catch (error) {
          console.error('Error navigating to profile:', error);
        }
      }
    },
    { label: 'Pagamentos', action: () => router.push('/provider/payments' as any) },
    { label: 'Métricas', action: () => router.push('/provider/analytics' as any) },
    { label: 'Integrações', action: () => { } },
    { label: 'Dados da conta', action: () => { } },
    { label: 'Plano', action: () => { } },
    { label: 'Meus Serviços', action: () => { } },
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={colors.textDark} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Menu</Text>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuOptions.map((option, index) => (
              <MenuItem
                key={index}
                label={option.label}
                onPress={option.action}
              />
            ))}
          </View>
        </ScrollView>
      </LinearGradient>

      <ProviderBottomNavBar activeTab="menu" />
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
    fontFamily: 'OpenSans-SemiBold',
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
});
