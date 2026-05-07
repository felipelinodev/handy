import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/theme/colors';
import { BottomNavBar } from '@/shared/components/BottomNavBar';
import { ScreenTopBar } from '@/features/contracts/components/ScreenTopBar';
import { ProviderSummaryCard } from '@/features/contracts/components/ProviderSummaryCard';
import { CancellationPolicyText } from '@/features/contracts/components/CancellationPolicyText';
import { useCancelContractPolicy } from '@/features/contracts/hooks/useCancelContractPolicy';

export default function CancelContractPolicyScreen() {
  const insets = useSafeAreaInsets();
  const { params, submitting, handleProceed } = useCancelContractPolicy();

  return (
    <ImageBackground
      source={require('../../../../assets/images/fundo_neutro_clean.png')}
      style={styles.background}>
      <View style={styles.flex}>
        <View style={[styles.topArea, { paddingTop: insets.top + 8 }]}>
          <View style={styles.topBarSpacer}>
            <ScreenTopBar />
          </View>

          <ProviderSummaryCard
            nome={params.prestadorNome}
            foto={params.prestadorFoto}
            categoria={params.prestadorCategoria}
            rating={params.prestadorRating}
            clientes={params.prestadorClientes}
          />
        </View>

        <View style={styles.sheet}>
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.handle} />

            <Text style={styles.title}>Politica de Cancelamento</Text>

            <CancellationPolicyText />

            <TouchableOpacity
              style={[styles.proceedBtn, submitting && styles.proceedBtnDisabled]}
              activeOpacity={0.85}
              disabled={submitting}
              onPress={handleProceed}>
              {submitting ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={styles.proceedBtnText}>Prosseguir</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <BottomNavBar activeTab="history" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: {
    flex: 1,
    backgroundColor: colors.muttedSurface,
  },
  topArea: {
    paddingHorizontal: 20,
  },
  topBarSpacer: {
    marginBottom: 16,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 24,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 140,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#BFBADE',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 18,
  },
  proceedBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedBtnDisabled: {
    opacity: 0.7,
  },
  proceedBtnText: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textWhite,
  },
});
