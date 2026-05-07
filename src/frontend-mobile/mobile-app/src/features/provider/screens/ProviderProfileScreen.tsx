import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/theme/colors';
import { HandyIcon } from '@/shared/components/HandyIcon';
import { fetchProviderProfile, fetchProviderServices } from '@/features/provider/services/providerService';
import ServiceCard from '@/features/provider/components/ServiceCard';
import ReviewCard from '@/features/provider/components/ReviewCard';
import { mockProviderProfile } from '@/features/provider/data/mockProvider';

export default function ProviderProfileScreen({ route, navigation }: any) {
  const { providerId } = route?.params || { providerId: 1 };
  const [provider, setProvider] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'experiencia' | 'opinioes' | 'servicos'>('opinioes');

  useEffect(() => {
    loadProviderData();
  }, [providerId]);

  async function loadProviderData() {
    try {
      setLoading(true);
      const data = await fetchProviderProfile(providerId);
      setProvider(data);
      
      const srvs = await fetchProviderServices(providerId);
      setServices(srvs && srvs.length > 0 ? srvs : mockProviderProfile.services);
    } catch (error: any) {
      setProvider(mockProviderProfile);
      setServices(mockProviderProfile.services);
    } finally {
      setLoading(false);
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'experiencia':
        const textArray = provider?.usuario?.descricao ? [provider.usuario.descricao] : mockProviderProfile.experienceText; 
        return (
          <View style={styles.tabContainer}>
            {textArray.map((txt: string, idx: number) => (
              <Text key={idx} style={styles.experienceText}>{txt}</Text>
            ))}
          </View>
        );
      case 'opinioes':
        const reviews = provider?.avaliacao || mockProviderProfile.reviews;
        return (
          <View style={styles.tabContainer}>
            {reviews.map((rev: any, idx: number) => (
              <ReviewCard key={idx} review={rev} />
            ))}
          </View>
        );
      case 'servicos':
        return (
          <View style={styles.tabContainer}>
            {services.map((srv: any, idx: number) => (
              <ServiceCard key={idx} service={srv} />
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Prestador não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBackground}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation?.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.imageContainer}>
             <Image
               source={provider.photo_url ? { uri: provider.photo_url } : require('../../../../assets/images/favicon.png')}
               style={styles.profileImage}
               contentFit="cover"
               transition={200}
               cachePolicy="memory-disk"
             />
        </View>
      
        <View style={styles.titleRow}>
            <Text style={styles.nameText}>{provider.usuario?.nome || 'Nome Indisponível'}</Text>
            <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color={colors.primary} />
                <Text style={styles.ratingText}>{provider.media_avaliacao || '0.0'}</Text>
            </View>
        </View>

        <View style={styles.professionPill}>
            <Text style={styles.professionText}>{provider.usuario?.descricao || 'Prestador de Serviço'}</Text>
        </View>

        <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color={colors.textDark} />
            <Text style={styles.infoText}>{provider.total_clientes || 0} Clientes.</Text>
        </View>

        <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={colors.textDark} />
            <Text style={styles.infoText}>{provider.usuario?.endereco || 'Endereço não informado'}</Text>
        </View>

        <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Contratar</Text>
                <Ionicons name="hand-right-outline" size={20} color={colors.surface} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Enviar</Text>
                <HandyIcon name="carbon:chat" size={20} color={colors.primary} />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'experiencia' && styles.tabButtonActive]} onPress={() => setActiveTab('experiencia')}>
          <Text style={[styles.tabText, activeTab === 'experiencia' && styles.tabTextActive]}>Experiência</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'opinioes' && styles.tabButtonActive]} onPress={() => setActiveTab('opinioes')}>
          <Text style={[styles.tabText, activeTab === 'opinioes' && styles.tabTextActive]}>Opiniões</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'servicos' && styles.tabButtonActive]} onPress={() => setActiveTab('servicos')}>
          <Text style={[styles.tabText, activeTab === 'servicos' && styles.tabTextActive]}>Serviços</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        {renderTabContent()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
  },
  headerBackground: {
    backgroundColor: '#dcd6fa',
    height: 180,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    marginTop: -40,
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameText: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 22,
    color: colors.textDark,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingText: {
    fontFamily: 'OpenSans_400Regular',
    color: colors.primary,
    marginLeft: 4,
    fontSize: 14,
  },
  professionPill: {
    backgroundColor: colors.muttedSurface,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 20,
  },
  professionText: {
    color: colors.primaryDark,
    fontFamily: 'OpenSans_400Regular',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
    marginLeft: 8,
    fontSize: 14,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  primaryButtonText: {
    fontFamily: 'OpenSans_700Bold',
    color: colors.surface,
    marginRight: 8,
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  secondaryButtonText: {
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
    marginRight: 8,
    fontSize: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 10,
    marginTop: -10,
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 16,
    color: colors.textDark,
  },
  tabTextActive: {
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
  },
  contentArea: {
    paddingHorizontal: 20,
  },
  tabContainer: {
    flex: 1,
  },
  experienceText: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    color: colors.textDark,
    lineHeight: 24,
    marginBottom: 16,
  }
});
