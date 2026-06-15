import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';

import colors from '@/theme/colors';
import { BASE_URL, getHeaders } from '@/services/apiConfig';

// ============================================================================
// REQUISITO TÉCNICO: CONSTANTES DE ENDPOINTS (PLACEHOLDERS VISÍVEIS)
// Substitua ou configure as URLs exatas da sua API nestas constantes:
// ============================================================================
const ENDPOINT_GET_MESSAGES = (conversaId: string | number) =>
  `${BASE_URL}/messages/view-menssages/${conversaId}`;

const ENDPOINT_SEND_MESSAGE = `${BASE_URL}/messages/create-menssage`;

// Intervalo de tempo para o polling em milissegundos (atualização REST)
const POLLING_INTERVAL_MS = 4000;

interface Message {
  mensagem_id: number;
  conversa_id: number;
  remetente_id: number;
  conteudo: string;
  remetente_tipo: string | null;
  anexo_url: string | null;
  created_at: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string; // ID da Conversa
    contratacaoId?: string;
    clienteId?: string;
    prestadorId?: string;
    title?: string;
    otherUserName?: string;
  }>();

  const conversaId = Number(params.id);
  const otherUserName = params.otherUserName || 'Conversa';

  // Referência para rolar a FlatList até o final
  const flatListRef = useRef<FlatList>(null);

  // Estados
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isChatClosed, setIsChatClosed] = useState(false);

  // Carregar usuário logado do AsyncStorage
  useEffect(() => {
    async function loadUser() {
      try {
        const userDataStr = await AsyncStorage.getItem('@auth_user');
        if (userDataStr) {
          const u = JSON.parse(userDataStr);
          setCurrentUserId(Number(u.user_id));
          setUserType(u.tipo_usuario);
        }
      } catch (error) {
        console.error('Erro ao ler usuário logado do AsyncStorage:', error);
      }
    }
    loadUser();
  }, []);

  // Verificar status do contrato associado para saber se está finalizado/cancelado
  useEffect(() => {
    async function checkContractStatus() {
      if (!params.contratacaoId) return;
      try {
        const headers = await getHeaders();
        const response = await fetch(`${BASE_URL}/contratations/view-a-contract/${params.contratacaoId}`, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const contract = await response.json();
          const statusLimpo = (contract.status || '')
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          if (['concluida', 'concluido', 'cancelada'].includes(statusLimpo)) {
            setIsChatClosed(true);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status do contrato:', error);
      }
    }

    checkContractStatus();
  }, [params.contratacaoId]);

  // 1. Carregar Histórico de Mensagens (GET)
  const fetchMessages = async (showLoadingIndicator = false) => {
    if (!conversaId) return;
    if (showLoadingIndicator) setLoading(true);

    try {
      const headers = await getHeaders();
      const response = await fetch(ENDPOINT_GET_MESSAGES(conversaId), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao obter mensagens`);
      }

      const data = await response.json();
      // O backend retorna { total: number, messages: Message[] }
      if (data && Array.isArray(data.messages)) {
        // Apenas atualiza o estado se houver mudança de tamanho para evitar rerenders desnecessários
        setMessages((prev) => {
          if (prev.length !== data.messages.length) {
            // Agenda rolagem para o final após atualização de mensagens
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
            return data.messages;
          }
          return prev;
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      if (showLoadingIndicator) setLoading(false);
    }
  };

  // Efeito para carregar as mensagens ao montar e configurar o Polling (REST)
  useEffect(() => {
    fetchMessages(true);

    // Configuração do polling periódico (atualização em tempo real REST)
    const interval = setInterval(() => {
      fetchMessages(false);
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [conversaId]);

  // ============================================================================
  // TEMPO REAL: ESTRUTURA E DIRETRIZES DE WEBSOCKET (SE O BACKEND SUPORTAR)
  // Caso habilite WebSockets no NestJS futuramente, você pode usar este bloco:
  // ============================================================================
  /*
  useEffect(() => {
    // 1. Instalar client: npm install socket.io-client
    // 2. Importar io: import { io } from 'socket.io-client';
    // 3. Inicializar a conexão:
    // const socket = io('http://YOUR_API_IP:4001', {
    //   query: { conversaId, token: TOKEN_AQUI }
    // });
    //
    // socket.on('connect', () => console.log('Conectado via WebSocket!'));
    //
    // 4. Ouvir novos eventos de mensagens:
    // socket.on('novaMensagem', (mensagem: Message) => {
    //   setMessages((prev) => [...prev, mensagem]);
    //   flatListRef.current?.scrollToEnd({ animated: true });
    // });
    //
    // return () => {
    //   socket.disconnect();
    // };
  }, [conversaId]);
  */

  // 2. Envio de Mensagens (POST)
  const handleSendMessage = async () => {
    if (isChatClosed) {
      Alert.alert('Aviso', 'Este chat foi encerrado pois o contrato foi finalizado.');
      return;
    }
    if (!inputText.trim() || !currentUserId || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const headers = await getHeaders();
      const payload = {
        conversa_id: conversaId,
        remetente_id: currentUserId,
        conteudo: messageText,
        remetente_tipo: userType || 'cliente',
        anexo_url: '',
      };

      const response = await fetch(ENDPOINT_SEND_MESSAGE, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Erro ao enviar mensagem.');
      }

      // Adiciona imediatamente à lista local após o sucesso do POST
      if (data.mensagem) {
        setMessages((prev) => [...prev, data.mensagem]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        // Fallback caso a resposta estrutural seja diferente
        fetchMessages(false);
      }
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Não foi possível enviar a mensagem.');
      // Restaura o texto digitado caso ocorra erro
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  // Formatar data em hora HH:MM
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // Renderizar cada balão de mensagem
  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMe = item.remetente_id === currentUserId;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.messageBubbleRight : styles.messageBubbleLeft,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.messageTextRight : styles.messageTextLeft,
            ]}
          >
            {item.conteudo}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMe ? styles.messageTimeRight : styles.messageTimeLeft,
            ]}
          >
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      {/* HEADER DA TELA */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Icon name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {otherUserName}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Conversa sobre o serviço
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => fetchMessages(true)}
          activeOpacity={0.7}
        >
          <Icon name="reload-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* HISTÓRICO DE MENSAGENS */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.mensagem_id.toString()}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="chatbubbles-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma mensagem por aqui.</Text>
              <Text style={styles.emptySubtext}>Envie uma mensagem abaixo para iniciar o chat!</Text>
            </View>
          }
        />
      )}

      {/* INPUT E BOTÃO DE ENVIO OU BANNER DE BLOQUEIO */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isChatClosed ? (
          <View style={styles.disabledInputArea}>
            <Icon name="lock-closed-outline" size={20} color={colors.textMuted} />
            <Text style={styles.disabledInputText}>
              Este contrato foi finalizado. Não é mais possível enviar mensagens.
            </Text>
          </View>
        ) : (
          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              placeholder="Digite sua mensagem..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              editable={!sending}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || sending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || sending}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.textWhite} />
              ) : (
                <Icon name="send" size={20} color={colors.textWhite} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.muttedSurface,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textSecondary,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    width: '100%',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  messageBubbleRight: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleLeft: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'OpenSans_400Regular',
  },
  messageTextRight: {
    color: colors.textWhite,
  },
  messageTextLeft: {
    color: colors.textDark,
  },
  messageTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
    fontFamily: 'OpenSans_400Regular',
  },
  messageTimeRight: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageTimeLeft: {
    color: colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceInput,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 15,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: colors.navInactive,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  disabledInputText: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
