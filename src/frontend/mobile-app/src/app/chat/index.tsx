import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

import colors from '@/theme/colors';
import { BASE_URL, getHeaders } from '@/services/apiConfig';
import { BottomNavBar } from '@/shared/components/BottomNavBar';
import { ProviderBottomNavBar } from '@/features/provider/components/ProviderBottomNavBar';
import { ensureThreadByContratacao } from '@/services/conversationsService';

const PROFILE_PLACEHOLDER = require('../../../assets/images/fundo_neutro.png');

interface ConversationItem {
  conversa_id?: number;
  contratacao_id: number;
  titulo: string;
  partner_name: string;
  partner_photo: string | null;
  partner_category: string;
  status: string;
  last_message?: string | null;
  last_message_at?: string | null;
}

export default function ChatListScreen() {
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  // Carregar dados de usuário logado
  useEffect(() => {
    async function loadUser() {
      try {
        const userDataStr = await AsyncStorage.getItem('@auth_user');
        if (userDataStr) {
          const u = JSON.parse(userDataStr);
          setUserType(u.tipo_usuario);
          setUserId(Number(u.user_id));
        }
      } catch (error) {
        console.error('Erro ao obter dados de usuário logado:', error);
      }
    }
    loadUser();
  }, []);

  // Buscar conversas da API
  const loadConversationsList = useCallback(async () => {
    if (!userId || !userType) return;
    setLoading(true);

    try {
      const headers = await getHeaders();

      if (userType === 'prestador') {
        // PRESTADOR: Consome o endpoint real do backend /conversations/list-by-prestador/:id
        const response = await fetch(`${BASE_URL}/conversations/list-by-prestador/${userId}`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error('Não foi possível carregar as conversas.');
        }

        const data = await response.json();
        // Mapeia o retorno da API para a interface unificada, filtrando por contratos aceitos
        if (Array.isArray(data)) {
          const acceptedStatuses = ['aceita', 'em_andamento', 'entregue'];
          const filtered = data.filter((item: any) => {
            const statusLimpo = (item.contratacao_status || '')
              .toLowerCase()
              .trim()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
            return acceptedStatuses.includes(statusLimpo);
          });

          const mapped: ConversationItem[] = filtered.map((item: any) => ({
            conversa_id: item.conversa_id,
            contratacao_id: item.contratacao_id,
            titulo: item.contratacao_titulo || 'Serviço Contratado',
            partner_name: item.cliente_nome || 'Cliente',
            partner_photo: item.cliente_photo_url,
            partner_category: 'Cliente',
            status: item.status || 'Aberta',
            last_message: item.ultima_mensagem_conteudo,
            last_message_at: item.ultima_mensagem_at,
          }));
          setConversations(mapped);
        }
      } else {
        // CLIENTE: Como não há list-by-cliente, buscamos os contratos dele e associamos à conversa
        const response = await fetch(`${BASE_URL}/contratations/view-all-contracts`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error('Não foi possível carregar os chats de serviços.');
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          // Filtra contratos desse cliente que foram aceitos
          const acceptedStatuses = ['aceita', 'em_andamento', 'entregue'];
          const clientContracts = data.filter((c: any) => {
            const isMyContract = Number(c.cliente_id) === userId;
            const statusLimpo = (c.status || '')
              .toLowerCase()
              .trim()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
            return isMyContract && acceptedStatuses.includes(statusLimpo);
          });
          
          // Mapeia para exibição rápida de conversas
          const mapped: ConversationItem[] = clientContracts.map((c: any) => ({
            contratacao_id: c.contratacao_id,
            titulo: c.titulo || 'Serviço',
            partner_name: c.prestador?.usuario?.nome || 'Profissional',
            partner_photo: c.prestador?.usuario?.photo_url || null,
            partner_category: c.prestador?.prestador_especialidade?.[0]?.especialidade?.nome_especialidade || 'Prestador',
            status: c.status || 'Ativo',
            last_message: c.detalhes || 'Clique para abrir o chat de conversa',
            last_message_at: c.created_at,
          }));
          setConversations(mapped);
        }
      }
    } catch (error: any) {
      console.warn('Erro ao carregar a lista de chats:', error.message);
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  // Recarregar toda vez que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadConversationsList();
    }, [loadConversationsList])
  );

  const handleOpenChat = async (item: ConversationItem) => {
    try {
      setLoading(true);
      // Se for prestador e já tiver o conversa_id, abre diretamente
      if (item.conversa_id) {
        router.push({
          pathname: '/chat/[id]',
          params: {
            id: item.conversa_id.toString(),
            contratacaoId: item.contratacao_id.toString(),
            conversaId: item.conversa_id.toString(),
            otherUserName: item.partner_name,
            title: item.titulo,
          }
        } as any);
      } else {
        // Se for cliente, garante que a conversa está criada no backend via ensureByContratacao
        const thread = await ensureThreadByContratacao(item.contratacao_id);
        router.push({
          pathname: '/chat/[id]',
          params: {
            id: thread.conversa_id.toString(),
            contratacaoId: item.contratacao_id.toString(),
            conversaId: thread.conversa_id.toString(),
            otherUserName: item.partner_name,
            title: item.titulo,
          }
        } as any);
      }
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Não foi possível carregar esta conversa.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => handleOpenChat(item)}
    >
      <Image
        source={item.partner_photo ? { uri: item.partner_photo } : PROFILE_PLACEHOLDER}
        style={styles.avatar}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.partnerName} numberOfLines={1}>
            {item.partner_name}
          </Text>
          <Text style={styles.statusLabel}>{item.status}</Text>
        </View>
        
        <Text style={styles.serviceTitle} numberOfLines={1}>
          {item.titulo}
        </Text>
        
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message || 'Nenhuma mensagem disponível.'}
        </Text>
      </View>
      <Icon name="chevron-forward" size={18} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../../assets/images/fundo_neutro.png')}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mensagens</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadConversationsList}>
            <Icon name="reload-outline" size={20} color={colors.textDark} />
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {loading && conversations.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item, index) => item.contratacao_id.toString() + index}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="chatbubble-ellipses-outline" size={56} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Nenhuma conversa</Text>
                <Text style={styles.emptySub}>
                  Suas conversas iniciadas por contratação de serviços aparecerão listadas aqui.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* RENDERIZAR MENU DE ACORDO COM O TIPO DE USUÁRIO */}
      {userType === 'prestador' ? (
        <ProviderBottomNavBar activeTab="clients" />
      ) : (
        <BottomNavBar activeTab="chat" />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 12,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 15,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    flex: 1,
  },
  statusLabel: {
    fontSize: 10,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.primary,
    backgroundColor: colors.muttedSurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 50,
  },
  serviceTitle: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textSecondary,
  },
  lastMessage: {
    fontSize: 12,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 100,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
