import React, { useCallback, useState } from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '../utils/colors';
import {
  AppNotification,
  clearAllNotifications,
  loadNotifications,
  markAllNotificationsAsRead,
} from '../services/notificationService';

interface StatusVisual {
  icon: keyof typeof Icon.glyphMap;
  color: string;
  bg: string;
}

const STATUS_VISUAL: Record<string, StatusVisual> = {
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

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora há pouco';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d} d`;
  const dt = new Date(ts);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${dt.getFullYear()}`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await loadNotifications();
    setItems(list);
    setLoading(false);
    if (list.some((n) => !n.read)) {
      await markAllNotificationsAsRead();
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function handleClear() {
    await clearAllNotifications();
    setItems([]);
  }

  function openContract(n: AppNotification) {
    router.push({
      pathname: '/contratations/[id]' as any,
      params: { id: String(n.contratoId) },
    });
  }

  return (
    <ImageBackground
      source={require('../assets/fundo_neutro_clean.png')}
      style={styles.background}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Icon name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Notificações</Text>
        {items.length > 0 ? (
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={handleClear}>
            <Icon name="trash-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>

      {loading ? null : items.length === 0 ? (
        <View style={styles.centered}>
          <Icon
            name="notifications-off-outline"
            size={36}
            color={colors.textMuted}
          />
          <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
          <Text style={styles.emptyText}>
            Quando o status de um contrato mudar, você verá uma mensagem aqui.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {items.map((n) => {
            const visual =
              STATUS_VISUAL[n.status] ?? {
                icon: 'information-circle-outline' as const,
                color: colors.textDark,
                bg: colors.muttedSurface,
              };
            return (
              <TouchableOpacity
                key={n.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => openContract(n)}>
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: visual.bg },
                  ]}>
                  <Icon name={visual.icon} size={20} color={visual.color} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardMessage}>{n.message}</Text>
                  <Text style={styles.cardTime}>{timeAgo(n.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.muttedSurface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
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
  iconPlaceholder: {
    width: 44,
    height: 44,
  },
  screenTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
  },
});
