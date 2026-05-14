import React, { useEffect, useRef, useState } from 'react';
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/theme/colors';
import { ProfessionalService } from '@/features/professionals/services/professionalService';
import { HandyIcon } from '@/shared/components/HandyIcon';
import { fetchProviderFreeSlots, AvailabilitySlot } from '@/features/provider/services/scheduleService';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.92;
const MAX_OBSERVATIONS = 500;

export type ServiceMode = 'presencial' | 'digital';

export interface ContractFormResult {
  service: ProfessionalService;
  mode: ServiceMode;
  slotId: number;
  date: string;
  time: string;
  address: string;
  observations: string;
}

interface ContractServiceBottomSheetProps {
  visible: boolean;
  service: ProfessionalService | null;
  providerId: number;
  providerName?: string;
  onClose: () => void;
  onConfirm: (data: ContractFormResult) => void;
}

function maskDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function maskTime(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export const ContractServiceBottomSheet: React.FC<ContractServiceBottomSheetProps> = ({
  visible,
  service,
  providerId,
  providerName,
  onClose,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [mode, setMode] = useState<ServiceMode>('presencial');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [observations, setObservations] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setMode('presencial');
      setSelectedSlotId(null);
      setSlots([]);
      setAddress('');
      setObservations('');
      setErrorMsg(null);

      // Load slots
      if (providerId) {
        setLoadingSlots(true);
        fetchProviderFreeSlots(providerId)
          .then(data => {
            // Sort by date/time
            data.sort((a, b) => {
              const dA = new Date(a.data_disponivel).getTime();
              const dB = new Date(b.data_disponivel).getTime();
              if (dA !== dB) return dA - dB;
              if (a.hora_inicio && b.hora_inicio) {
                return a.hora_inicio.localeCompare(b.hora_inicio);
              }
              return 0;
            });
            setSlots(data);
          })
          .catch(() => {})
          .finally(() => setLoadingSlots(false));
      }

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
  }, [visible, translateY, backdropOpacity]);

  function handleConfirm() {
    if (!service) return;

    if (!selectedSlotId) {
      setErrorMsg('Por favor, selecione um horário disponível.');
      return;
    }
    if (mode === 'presencial' && address.trim().length === 0) {
      setErrorMsg('Endereço é obrigatório para serviços presenciais.');
      return;
    }

    const slot = slots.find(s => s.agenda_id === selectedSlotId);
    if (!slot) return;

    const dateStr = slot.data_disponivel.split('T')[0];
    const parts = dateStr.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    const formattedTime = slot.hora_inicio ? slot.hora_inicio.slice(0, 5) : '';

    setErrorMsg(null);
    onConfirm({
      service,
      mode,
      slotId: selectedSlotId,
      date: formattedDate,
      time: formattedTime,
      address: address.trim(),
      observations: observations.trim(),
    });
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
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: SHEET_MAX_HEIGHT,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY }],
            },
          ]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Confirmar contratação</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                Revise os dados antes de seguir
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
            {service && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {service.name}
                  </Text>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeLabel}>Valor</Text>
                    <Text style={styles.priceBadgeValue}>
                      R$ {service.price.toLocaleString('pt-BR')}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardRow}>
                    <Icon name="person-outline" size={16} color={colors.primary} />
                    <Text style={styles.cardRowLabel}>Prestador</Text>
                    <Text style={styles.cardRowValue} numberOfLines={1}>
                      {providerName ?? '—'}
                    </Text>
                  </View>

                  {!!service.category && (
                    <View style={styles.cardRow}>
                      <Icon name="pricetag-outline" size={16} color={colors.primary} />
                      <Text style={styles.cardRowLabel}>Categoria</Text>
                      <Text style={styles.cardRowValue} numberOfLines={1}>
                        {service.category}
                      </Text>
                    </View>
                  )}

                  {!!service.description && (
                    <View style={styles.descriptionBlock}>
                      <Text style={styles.descriptionLabel}>Descrição</Text>
                      <Text style={styles.descriptionText}>
                        {service.description}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <Text style={styles.sectionLabel}>Tipo de serviço</Text>
            <Text style={styles.sectionHelper}>
              Selecione como o serviço será executado.
            </Text>
            <View style={styles.radioGroup}>
              <RadioOption
                label="Presencial"
                description="Prestador comparece em local definido"
                icon="location-outline"
                selected={mode === 'presencial'}
                onPress={() => setMode('presencial')}
              />
              <RadioOption
                label="Digital"
                description="Atendimento remoto / online"
                icon="laptop-outline"
                selected={mode === 'digital'}
                onPress={() => setMode('digital')}
              />
            </View>

            <Text style={styles.sectionLabel}>Data e horário</Text>
            <Text style={styles.sectionHelper}>
              Selecione um dos horários disponíveis do prestador.
            </Text>
            {loadingSlots ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
            ) : slots.length === 0 ? (
              <View style={styles.emptySlotsBox}>
                <Text style={styles.emptySlotsText}>
                  Este prestador não possui horários livres no momento.
                </Text>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.slotsScroll}
              >
                {slots.map(slot => {
                  const isSelected = selectedSlotId === slot.agenda_id;
                  const dateStr = slot.data_disponivel.split('T')[0];
                  const dParts = dateStr.split('-');
                  const dFormatted = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}` : dateStr;
                  const tStart = slot.hora_inicio ? slot.hora_inicio.slice(0, 5) : '--:--';
                  
                  return (
                    <TouchableOpacity 
                      key={slot.agenda_id}
                      style={[styles.slotCard, isSelected && styles.slotCardSelected]}
                      activeOpacity={0.7}
                      onPress={() => setSelectedSlotId(slot.agenda_id)}
                    >
                      <Text style={[styles.slotDateText, isSelected && styles.slotDateTextSelected]}>
                        {dFormatted}
                      </Text>
                      <Text style={[styles.slotTimeText, isSelected && styles.slotTimeTextSelected]}>
                        {tStart}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {mode === 'presencial' && (
              <>
                <Text style={styles.sectionLabel}>Endereço</Text>
                <Text style={styles.sectionHelper}>
                  Onde o prestador deve comparecer.
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Rua, número, bairro, cidade"
                  placeholderTextColor={colors.textMuted}
                  value={address}
                  onChangeText={setAddress}
                  maxLength={200}
                />
              </>
            )}

            <Text style={styles.sectionLabel}>Observações</Text>
            <Text style={styles.sectionHelper}>
              Inclua detalhes adicionais para o prestador (opcional).
            </Text>
            <TextInput
              style={styles.textarea}
              placeholder={
                mode === 'digital'
                  ? 'Ex.: prefiro chamada por Google Meet, enviar link 10 min antes...'
                  : 'Ex.: prédio com elevador, falar com a portaria...'
              }
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              value={observations}
              onChangeText={setObservations}
              maxLength={MAX_OBSERVATIONS}
            />
            <Text style={styles.counter}>
              {observations.length}/{MAX_OBSERVATIONS}
            </Text>

            {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            <TouchableOpacity
              style={styles.confirmButton}
              activeOpacity={0.85}
              onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Solicitar contratação</Text>
              <HandyIcon
                name="hugeicons:agreement-02"
                size={20}
                color={colors.textWhite}
              />
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

interface RadioOptionProps {
  label: string;
  description: string;
  icon: keyof typeof Icon.glyphMap;
  selected: boolean;
  onPress: () => void;
}

const RadioOption: React.FC<RadioOptionProps> = ({
  label,
  description,
  icon,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.radioOption, selected && styles.radioOptionSelected]}
    activeOpacity={0.85}
    onPress={onPress}>
    <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
      {selected && <View style={styles.radioDot} />}
    </View>
    <Icon
      name={icon}
      size={18}
      color={selected ? colors.primary : colors.textMuted}
      style={styles.radioIcon}
    />
    <View style={styles.radioTextWrap}>
      <Text
        style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
        {label}
      </Text>
      <Text style={styles.radioDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

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
    shadowColor: '#000',
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
    backgroundColor: '#E0DDF7',
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
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#4A1D96',
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
    backgroundColor: '#F0E6FF',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  priceBadge: {
    alignItems: 'flex-end',
  },
  priceBadgeLabel: {
    fontSize: 11,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
  },
  priceBadgeValue: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
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
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  cardRowValue: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    textAlign: 'right',
  },
  descriptionBlock: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  descriptionLabel: {
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  sectionHelper: {
    marginTop: 2,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
  },
  radioGroup: {
    gap: 10,
    marginBottom: 18,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  radioOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0E6FF',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioIcon: {
    marginLeft: 2,
  },
  radioTextWrap: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 13,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  radioLabelSelected: {
    color: colors.primary,
  },
  radioDescription: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
  },
  emptySlotsBox: {
    padding: 16,
    backgroundColor: '#FFF1F2',
    borderRadius: 12,
    marginBottom: 18,
  },
  emptySlotsText: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.error,
    textAlign: 'center',
  },
  slotsScroll: {
    paddingRight: 20,
    paddingVertical: 4,
    gap: 12,
    marginBottom: 14,
  },
  slotCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  slotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  slotDateText: {
    fontSize: 13,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  slotDateTextSelected: {
    color: colors.textWhite,
  },
  slotTimeText: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  slotTimeTextSelected: {
    color: '#E0DDF7',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
    marginBottom: 4,
  },
  textarea: {
    minHeight: 110,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
  },
  counter: {
    alignSelf: 'flex-end',
    marginTop: 6,
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  errorText: {
    marginTop: 12,
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.error,
  },
  confirmButton: {
    marginTop: 18,
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: colors.textWhite,
    fontSize: 15,
    fontFamily: 'OpenSans_700Bold',
  },
});
