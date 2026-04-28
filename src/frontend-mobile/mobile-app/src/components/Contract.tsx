import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../theme/colors';
import { BottomNavBar } from './BottomNavBar';
import { Contratacao } from '../services/contractService';
import { BackButton } from './common/Backbutton';
import { ProjectFinished } from './ProjectFinished';
import { RateService } from './RateService';
import { NotificationButton } from './common/NotificationButton';

export interface PrestadorInfo {
  nome: string;
  photo_url?: string | null;
  media_avaliacao?: number | null;
  total_clientes?: number | null;
  especialidade?: string | null;
}

interface ContractCardProps {
  contrato: Contratacao;
  prestador: PrestadorInfo;
  valorServico?: number | null;
  isLoading?: boolean;
  error?: string | null;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR');
}

function formatMoney(value?: number | null): string {
  if (value == null) return '—';
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function LoadingState() {
  return (
    <View style={styles.centerState}>
      <ActivityIndicator size="large" color={Colors.purpleMedium} />
      <Text style={styles.loadingText}>Carregando contrato...</Text>
    </View>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <View style={styles.centerState}>
      <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const DETAILS_CHAR_LIMIT = 200;

export const ContractCard: React.FC<ContractCardProps> = ({
  contrato,
  prestador,
  valorServico,
  isLoading = false,
  error = null,
}) => {
  const router = useRouter();
  const [expandedDetails, setExpandedDetails] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [showRating, setShowRating] = useState(false);

  // Exibe o modal de projeto finalizado automaticamente quando o status indica conclusão
  useEffect(() => {
    const statusNorm = contrato?.status?.toLowerCase().trim() ?? '';
    if (
      statusNorm === 'concluido' ||
      statusNorm === 'concluído' ||
      statusNorm === 'finalizado'
    ) {
      setShowFinished(true);
    }
  }, [contrato?.status]);

  const detalhesTexto = contrato?.detalhes ?? 'Sem detalhes cadastrados.';
  const isLong = detalhesTexto.length > DETAILS_CHAR_LIMIT;
  const textoExibido = !expandedDetails && isLong
    ? detalhesTexto.slice(0, DETAILS_CHAR_LIMIT) + '...'
    : detalhesTexto;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[Colors.gradientTop, Colors.gradientMiddle]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
      />
      <View style={styles.topNav}>
        <BackButton />

        <Text style={styles.navTitle}>CONTRATO</Text>

        <NotificationButton />
      </View>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.providerRow}>
              {prestador.photo_url ? (
                <Image
                  source={{ uri: prestador.photo_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Ionicons name="person" size={30} color={Colors.purpleMedium} />
                </View>
              )}

              <View style={styles.providerInfo}>
                <View style={styles.providerNameRow}>
                  <Text style={styles.providerName} numberOfLines={1}>
                    {prestador.nome}
                  </Text>
                  <View style={styles.ratingPill}>
                    <FontAwesome
                      name="star"
                      size={11}
                      color={Colors.starYellow}
                    />
                    <Text style={styles.ratingText}>
                      {' '}
                      {prestador.media_avaliacao != null
                        ? Number(prestador.media_avaliacao).toFixed(1)
                        : '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.providerMetaRow}>
                  {prestador.especialidade && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {prestador.especialidade}
                      </Text>
                    </View>
                  )}
                  <View style={styles.clientsRow}>
                    <Ionicons
                      name="people-outline"
                      size={13}
                      color={Colors.textMuted}
                    />
                    <Text style={styles.clientsText}>
                      {' '}
                      {prestador.total_clientes ?? 0} Clientes
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.card}>

            <View style={styles.contractTitleRow}>
              <View style={styles.contractIconWrap}>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={Colors.purpleMedium}
                />
              </View>
              <Text style={styles.contractTitle} numberOfLines={2}>
                {contrato.titulo}
              </Text>
            </View>

            <View style={styles.metaLine}>
              <Text style={styles.metaLabel}>Valor: </Text>
              <Text style={styles.metaValueAccent}>
                {formatMoney(valorServico)}
              </Text>
            </View>

            <View style={styles.metaLineWrap}>
              <Text style={styles.metaLabel}>Local: </Text>
              <Text style={styles.metaValue}>
                {contrato.endereco ?? '—'}
              </Text>
              <Text style={[styles.metaLabel, styles.metaSpacer]}>
                Prazo:{' '}
              </Text>
              <Text style={styles.metaValue}>
                {formatDate(contrato.vencimento)}
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {contrato.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes</Text>
            <View style={styles.detailsBox}>
              <Text style={styles.detailsText}>
                {textoExibido}
              </Text>
              {isLong && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setExpandedDetails(prev => !prev)}
                >
                  <Text style={styles.lerMais}>
                    {expandedDetails ? 'Ler menos.' : 'Ler mais.'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.btnOutline}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Em breve', 'A funcionalidade de solicitar cancelamento estará disponível em breve.')}
            >
              <Text style={styles.btnOutlineText}>Solicitar Cancelamento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnFilled}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Em breve', 'A funcionalidade de chat com o prestador estará disponível em breve.')}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={15}
                color={Colors.white}
              />
              <Text style={styles.btnFilledText}>Ver mensagens</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 110 }} />
        </ScrollView>
      )}

      <ProjectFinished
        visible={showFinished}
        onDismiss={() => setShowFinished(false)}
        onAvaliar={() => {
          setShowFinished(false);
          setShowRating(true);
        }}
      />

      <RateService
        visible={showRating}
        onDismiss={() => setShowRating(false)}
        prestadorNome={prestador.nome}
      />
    </View>
  );
};

// Campo de Styles

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.gradientTop,
  },

  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 12,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.purpleDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  navTitle: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: Colors.purpleDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 14,
  },
  avatarFallback: {
    backgroundColor: Colors.tagBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInfo: {
    flex: 1,
    gap: 6,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerName: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  ratingText: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  providerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    backgroundColor: Colors.pillBackground,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 11,
    color: Colors.white,
  },
  clientsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientsText: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
  },

  contractTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  contractIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.tagBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contractTitle: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaLineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
  },
  metaLabel: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
  },
  metaSpacer: {
    marginLeft: 10,
  },
  metaValueAccent: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 13,
    color: Colors.purpleVibrant,
  },
  metaValue: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
  },
  statusText: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 12,
    color: Colors.purpleMedium,
  },

  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  detailsBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDE9F8',
    shadowColor: Colors.purpleDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  detailsText: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  lerMais: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 13,
    color: Colors.purpleVibrant,
    marginTop: 4,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  btnOutline: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.purpleMedium,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  btnOutlineText: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 12,
    color: Colors.purpleMedium,
  },
  btnFilled: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.purpleMedium,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowColor: Colors.purpleDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnFilledText: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 12,
    color: Colors.white,
  },

  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  loadingText: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    color: Colors.textMuted,
  },
  errorText: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
});