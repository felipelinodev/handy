import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import Icon from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '../utils/colors';
import { fetchProfessionalById, ProfessionalListItem, ProfessionalService } from '../services/professionalService';
import { BottomNavBar } from '../components/BottomNavBar';
import { ServiceCard } from '../components/ServiceCard';
import { HandyIcon } from '@/components/HandyIcon';
import { ServicesBottomSheet } from '../components/ServicesBottomSheet';
import {
  ContractFormResult,
  ContractServiceBottomSheet,
} from '../components/ContractServiceBottomSheet';
import { NotificationBell } from '../components/NotificationBell';
import { fetchProviderContracts } from '../services/contractService';
import { syncProviderContractNotifications } from '../services/notificationService';

type TabKey = 'experiencia' | 'opinioes' | 'servicos';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'experiencia', label: 'Experiência' },
  { key: 'opinioes', label: 'Opiniões' },
  { key: 'servicos', label: 'Serviços' },
];

const PROFILE_PLACEHOLDER = require('../assets/fundo_neutro.png');

export default function ProfessionalProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('experiencia');
  const [professional, setProfessional] = useState<ProfessionalListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [servicesSheetVisible, setServicesSheetVisible] = useState(false);
  const [contractSheetVisible, setContractSheetVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<ProfessionalService | null>(null);

  function handleSelectService(service: ProfessionalService) {
    setServicesSheetVisible(false);
    setSelectedService(service);
    setContractSheetVisible(true);
  }

  function handleConfirmContract(form: ContractFormResult) {
    setContractSheetVisible(false);
    if (!professional) return;

    router.push({
      pathname: '/contratations/accep-contract',
      params: {
        servicoId: String(form.service.id),
        prestadorId: professional.id,
        servicoNome: form.service.name,
        servicoDescricao: form.service.description,
        preco: String(form.service.price),
        prestadorNome: professional.name,
        prestadorFoto: professional.photoUrl ?? '',
        prestadorCategoria: professional.category,
        prestadorRating: String(professional.rating),
        prestadorClientes: String(professional.clientsCount),
        modo: form.mode,
        data: form.date,
        hora: form.time,
        endereco: form.address,
        observacoes: form.observations,
      },
    });
  }

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchProfessionalById(id);
        if (isMounted) {
          setProfessional(data);
          setErrorMsg(null);
        }

        const userDataString = await AsyncStorage.getItem('@auth_user');
        if (userDataString && isMounted) {
          const u = JSON.parse(userDataString);
          if (u && String(u.user_id) === String(id)) {
            setIsOwner(true);
            try {
              const contratos = await fetchProviderContracts(Number(id));
              await syncProviderContractNotifications(contratos, (c) => ({
                servicoNome: data.services.find((s) => s.id === c.servico_id)?.name ?? c.titulo,
                clienteNome: undefined,
              }));
            } catch { }
          } else {
            setIsOwner(false);
          }
        }
      } catch (error: any) {
        if (isMounted) setErrorMsg(error?.message ?? 'Erro ao carregar prestador.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/fundo_principal.png')}
        style={styles.background}>
        <View style={[styles.notFound, { paddingTop: insets.top + 40 }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ImageBackground>
    );
  }

  if (errorMsg || !professional) {
    return (
      <ImageBackground
        source={require('../assets/fundo_neutro_clean.png')}
        style={styles.background}>
        <View style={[styles.notFound, { paddingTop: insets.top + 40 }]}>
          <Text style={styles.notFoundText}>{errorMsg ?? 'Profissional não encontrado.'}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.notFoundLink}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/fundo_neutro_clean.png')}
      style={styles.background}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8, paddingBottom: 140 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => router.back()}>
            <Icon name="chevron-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.topBarRight}>
            {isOwner && (
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={() => router.push(`/professional/edit/${id}` as any)}>
                <Icon name="create-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
            )}
            <NotificationBell />
          </View>
        </View>

        {/* Profile card */}
        <View style={styles.profileRow}>
          <Image
            source={professional.photoUrl ? { uri: professional.photoUrl + `?_t=${Date.now()}` } : PROFILE_PLACEHOLDER}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
            cachePolicy="none"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {professional.name}
            </Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>{professional.category}</Text>
            </View>
          </View>
          <View style={styles.ratingBox}>
            <Icon name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>{professional.rating}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsBlock}>
          <View style={styles.statRow}>
            <Icon name="people-outline" size={18} color={colors.textDark} />
            <Text style={styles.statText}>
              {professional.clientsCount} Clientes.
            </Text>
          </View>
          <View style={styles.statRow}>
            <Icon name="location-outline" size={18} color={colors.textDark} />
            <Text style={styles.statText}>{professional.address}</Text>
          </View>
        </View>

        {/* Action buttons */}
        {!isOwner && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => setServicesSheetVisible(true)}>
              <Text style={styles.primaryButtonText}>Contratar</Text>
              <HandyIcon name="hugeicons:agreement-02" size={22} color={colors.textWhite} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
              <Text style={styles.secondaryButtonText}>Enviar</Text>
              <HandyIcon name="carbon:chat" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Owner action buttons */}
        {isOwner && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => router.push('/contratations/provider-contracts' as any)}>
              <Icon name="people-outline" size={20} color={colors.textWhite} />
              <Text style={styles.primaryButtonText}>Clientes Atuais</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.key)}>
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {isActive && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {activeTab === 'experiencia' && (
            <>
              <Text style={styles.paragraph}>{professional.description}</Text>
              <Text style={styles.paragraph}>{professional.description}</Text>
            </>
          )}
          {activeTab === 'opinioes' && (
            <Text style={styles.paragraph}>
              Sem opiniões cadastradas ainda.
            </Text>
          )}
          {activeTab === 'servicos' && (
            <View>
              {professional.services.length === 0 ? (
                <Text style={styles.paragraph}>
                  {isOwner ? 'Você ainda não cadastrou serviços.' : 'Sem serviços cadastrados.'}
                </Text>
              ) : (
                professional.services.map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    onPressEdit={
                      isOwner
                        ? () => router.push(`/professional/edit-service/${s.id}` as any)
                        : undefined
                    }
                  />
                ))
              )}
              {isOwner && (
                <TouchableOpacity
                  style={styles.addServiceButton}
                  activeOpacity={0.85}
                  onPress={() => router.push(`/professional/add-service/${id}` as any)}>
                  <Icon name="add-circle-outline" size={20} color={colors.textWhite} />
                  <Text style={styles.addServiceButtonText}>Adicionar serviço</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavBar activeTab={isOwner ? "history" : "search"} />

      {!isOwner && (
        <>
          <ServicesBottomSheet
            visible={servicesSheetVisible}
            providerName={professional.name}
            services={professional.services}
            onClose={() => setServicesSheetVisible(false)}
            onSelect={handleSelectService}
          />
          <ContractServiceBottomSheet
            visible={contractSheetVisible}
            service={selectedService}
            providerName={professional.name}
            onClose={() => setContractSheetVisible(false)}
            onConfirm={handleConfirmContract}
          />
        </>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.muttedSurface,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,

  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#E0D5F0',
  },
  profileInfo: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: 'flex-start'
  },
  name: {
    paddingHorizontal: 10,
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginBottom: 6,
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.muttedSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rolePillText: {
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    backgroundColor: '#CBC3F8',
    padding: 3,
    paddingHorizontal: 20,
    borderRadius: 50,
    color: colors.primary,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  statsBlock: {
    gap: 8,
    marginBottom: 18,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
    flexShrink: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1.5,
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: colors.textWhite,
    fontSize: 15,
    fontFamily: 'OpenSans_700Bold',
  },
  secondaryButton: {
    flex: 1,
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 10,
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: 'OpenSans_700Bold',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.15)',
    marginBottom: 18,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontFamily: 'OpenSans_700Bold',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  tabContent: {
    gap: 14,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
  },
  notFoundLink: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 48,
    marginTop: 16,
  },
  addServiceButtonText: {
    color: colors.textWhite,
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
  },
});
