import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/theme/colors';
import { Fonts } from '@/theme/fonts';
import {
  Contratacao,
  updateContractStatus,
} from '@/features/contracts/services/contractService';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.82;

export interface ContractOption {
  contratacao_id: number;
  cliente_id: number;
  cliente_nome?: string | null;
  titulo: string | null;
  status: string | null;
}

interface CompleteServiceSheetProps {
  visible: boolean;
  onClose: () => void;
  onCompleted: (contract: Contratacao) => void;
  contracts: ContractOption[];
  contractsLoading?: boolean;
  submitting?: boolean;
}

export const CompleteServiceSheet: React.FC<CompleteServiceSheetProps> = ({
  visible,
  onClose,
  onCompleted,
  contracts,
  contractsLoading = false,
  submitting: externalSubmitting = false,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSubmitting = submitting || externalSubmitting;

  const eligibleContracts = useMemo(
    () =>
      contracts.filter((c) => {
        const s = (c.status ?? '').toLowerCase().trim();
        return s !== 'concluído' && s !== 'concluída' && s !== 'entregue' && s !== 'cancelado' && s !== 'cancelada';
      }),
    [contracts],
  );

  const selectedContract = useMemo(
    () => eligibleContracts.find((c) => c.contratacao_id === selectedId) ?? null,
    [eligibleContracts, selectedId],
  );

  useEffect(() => {
    if (visible) {
      setErrorMsg(null);
      setShowPicker(false);
      setSelectedId(eligibleContracts[0]?.contratacao_id ?? null);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity, eligibleContracts]);

  async function handleConfirm() {
    if (!selectedContract) {
      setErrorMsg('Selecione um contrato para concluir.');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    try {
      const updated = await updateContractStatus(
        selectedContract.contratacao_id,
        'Entregue',
      );
      onCompleted(updated);
    } catch (err: any) {
      console.error('[CompleteServiceSheet] Error completing service:', err);
      setErrorMsg(err?.message ?? 'Erro ao concluir o serviço. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  function getPickerLabel(): string {
    if (!selectedContract) return 'Selecionar contrato';
    const name =
      selectedContract.cliente_nome ?? `Cliente #${selectedContract.cliente_id}`;
    const title = selectedContract.titulo ? ` · ${selectedContract.titulo}` : '';
    return `${name}${title}`;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: SHEET_MAX_HEIGHT,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY }],
            },
          ]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Marcar como Entregue</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                Confirme a entrega do serviço
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={10}
              activeOpacity={0.7}
              style={styles.closeButton}>
              <Icon name="close" size={20} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>

            {/* Info banner */}
            <View style={styles.infoBanner}>
              <View style={styles.infoBannerIconWrap}>
                <Icon name="checkmark-circle-outline" size={22} color={colors.success} />
              </View>
              <Text style={styles.infoBannerText}>
                Ao marcar como entregue, o status do contrato será atualizado para{' '}
                <Text style={styles.infoBannerBold}>Entregue</Text>. O cliente deverá
                confirmar a entrega para que o serviço seja concluído.
              </Text>
            </View>

            {/* Contract selection */}
            <Text style={styles.sectionLabel}>Contrato</Text>
            <Text style={styles.sectionHelper}>
              Selecione o contrato que foi finalizado.
            </Text>

            <TouchableOpacity
              style={[
                styles.pickerButton,
                !selectedContract && styles.pickerButtonEmpty,
              ]}
              activeOpacity={0.7}
              onPress={() => setShowPicker(true)}
              disabled={contractsLoading || eligibleContracts.length === 0}>
              <View style={styles.pickerButtonLeft}>
                <Icon name="document-text-outline" size={18} color={colors.primary} />
                <Text
                  style={[
                    styles.pickerButtonText,
                    !selectedContract && styles.pickerButtonPlaceholder,
                  ]}
                  numberOfLines={1}>
                  {contractsLoading
                    ? 'Carregando contratos...'
                    : eligibleContracts.length === 0
                    ? 'Nenhum contrato ativo'
                    : getPickerLabel()}
                </Text>
              </View>
              <Icon name="chevron-down" size={18} color={colors.primary} />
            </TouchableOpacity>

            {/* Selected contract details */}
            {selectedContract && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {selectedContract.titulo ?? `Contrato #${selectedContract.contratacao_id}`}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {selectedContract.status ?? '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardRow}>
                    <Icon name="person-outline" size={15} color={colors.primary} />
                    <Text style={styles.cardRowLabel}>Cliente</Text>
                    <Text style={styles.cardRowValue} numberOfLines={1}>
                      {selectedContract.cliente_nome ??
                        `Cliente #${selectedContract.cliente_id}`}
                    </Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Icon name="document-outline" size={15} color={colors.primary} />
                    <Text style={styles.cardRowLabel}>Contrato ID</Text>
                    <Text style={styles.cardRowValue}>
                      #{selectedContract.contratacao_id}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Error message */}
            {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            {/* Actions */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.7}
                onPress={onClose}
                disabled={isSubmitting}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (isSubmitting || !selectedContract) && styles.confirmButtonDisabled,
                ]}
                activeOpacity={0.85}
                disabled={isSubmitting || !selectedContract}
                onPress={handleConfirm}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.textWhite} />
                ) : (
                  <>
                    <Text style={styles.confirmButtonText}>Marcar como Entregue</Text>
                    <Icon
                      name="checkmark-circle-outline"
                      size={19}
                      color={colors.textWhite}
                    />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Dropdown picker */}
        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}>
          <Pressable
            style={styles.dropdownBackdrop}
            onPress={() => setShowPicker(false)}>
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownHeader}>Selecione o contrato</Text>
              <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.45 }}>
                {eligibleContracts.map((c) => {
                  const isActive = c.contratacao_id === selectedId;
                  return (
                    <TouchableOpacity
                      key={c.contratacao_id}
                      style={[
                        styles.dropdownItem,
                        isActive && styles.dropdownItemActive,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedId(c.contratacao_id);
                        setShowPicker(false);
                      }}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.dropdownItemTitle,
                            isActive && styles.dropdownItemTitleActive,
                          ]}
                          numberOfLines={1}>
                          {c.cliente_nome ?? `Cliente #${c.cliente_id}`}
                        </Text>
                        {!!c.titulo && (
                          <Text
                            style={styles.dropdownItemSubtitle}
                            numberOfLines={1}>
                            {c.titulo}
                          </Text>
                        )}
                        {!!c.status && (
                          <Text style={styles.dropdownItemHint}>
                            Status: {c.status}
                          </Text>
                        )}
                      </View>
                      {isActive && (
                        <Icon name="checkmark" size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 19, 65, 0.45)',
  },
  sheet: {
    backgroundColor: colors.surfaceInput,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: colors.textDark,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.textMuted,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.muttedSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  // Info banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.successSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.successBorder,
    padding: 14,
    marginBottom: 20,
  },
  infoBannerIconWrap: {
    marginTop: 1,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.successDark,
    lineHeight: 19,
  },
  infoBannerBold: {
    fontFamily: Fonts.bold,
  },
  // Section labels
  sectionLabel: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: colors.textDark,
  },
  sectionHelper: {
    marginTop: 2,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.textMuted,
  },
  // Contract picker
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  pickerButtonEmpty: {
    borderColor: colors.textMuted,
    opacity: 0.7,
  },
  pickerButtonLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.textDark,
  },
  pickerButtonPlaceholder: {
    color: colors.textMuted,
    fontFamily: Fonts.regular,
  },
  // Selected contract card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.primarySurface,
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: colors.textDark,
  },
  statusBadge: {
    backgroundColor: colors.muttedSurface,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: colors.primary,
  },
  cardBody: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardRowLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.textMuted,
  },
  cardRowValue: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: colors.textDark,
    textAlign: 'right',
  },
  // Error
  errorText: {
    marginBottom: 12,
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.error,
  },
  // Buttons
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  confirmButton: {
    flex: 1.4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.successMuted,
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: colors.textWhite,
  },
  // Dropdown
  dropdownBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 19, 65, 0.45)',
    paddingHorizontal: 24,
  },
  dropdownContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  dropdownHeader: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: colors.primary,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderRadius: 12,
  },
  dropdownItemActive: {
    backgroundColor: colors.muttedSurface,
  },
  dropdownItemTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.textDark,
  },
  dropdownItemTitleActive: {
    color: colors.primary,
    fontFamily: Fonts.bold,
  },
  dropdownItemSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  dropdownItemHint: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: colors.textSecondary,
  },
});
