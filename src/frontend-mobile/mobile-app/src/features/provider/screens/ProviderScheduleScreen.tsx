import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '@/theme/colors';
import { Fonts } from '@/theme/fonts';
import { ProviderBottomNavBar } from '@/features/provider/components/ProviderBottomNavBar';
import {
  AvailabilitySlot,
  CreateAvailabilityPayload,
  createAvailabilitySlots,
  deleteAvailabilitySlot,
  fetchProviderSchedule,
} from '@/features/provider/services/scheduleService';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateISO(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function formatDateBR(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function maskTime(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export default function ProviderScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [providerId, setProviderId] = useState<number | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');

  const existingDates = new Set(
    slots.map((s) => s.data_disponivel.split('T')[0]),
  );

  const loadSchedule = useCallback(async (pid: number) => {
    try {
      setLoading(true);
      const data = await fetchProviderSchedule(pid);
      setSlots(data);
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Erro ao carregar agenda.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const userData = await AsyncStorage.getItem('@auth_user');
        if (userData) {
          const user = JSON.parse(userData);
          const id = Number(user?.user_id);
          if (id) {
            setProviderId(id);
            await loadSchedule(id);
            return;
          }
        }
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
    init();
  }, [loadSchedule]);

  function toggleDate(dateISO: string) {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateISO)) {
        next.delete(dateISO);
      } else {
        next.add(dateISO);
      }
      return next;
    });
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  async function handleSave() {
    if (!providerId || selectedDates.size === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um dia no calendário.');
      return;
    }

    const payloads: CreateAvailabilityPayload[] = [];
    
    Array.from(selectedDates).forEach((dateISO) => {
      if (startTime.length === 5 && endTime.length === 5) {
        const startHour = parseInt(startTime.split(':')[0], 10);
        const endHour = parseInt(endTime.split(':')[0], 10);
        
        // Se a hora de fim for menor ou igual, ou inválida, criamos um slot único
        if (startHour >= endHour || isNaN(startHour) || isNaN(endHour)) {
           payloads.push({
             prestador_id: providerId,
             data_disponivel: dateISO,
             hora_inicio: `${startTime}:00`,
             hora_fim: `${endTime}:00`,
           });
        } else {
          // Cria slots de 1 em 1 hora
          for (let h = startHour; h < endHour; h++) {
            const hStart = String(h).padStart(2, '0');
            const hEnd = String(h + 1).padStart(2, '0');
            payloads.push({
              prestador_id: providerId,
              data_disponivel: dateISO,
              hora_inicio: `${hStart}:00:00`,
              hora_fim: `${hEnd}:00:00`,
            });
          }
        }
      } else {
        payloads.push({
          prestador_id: providerId,
          data_disponivel: dateISO,
        });
      }
    });

    setSaving(true);
    try {
      await createAvailabilitySlots(payloads);
      Alert.alert('Sucesso', `${payloads.length} disponibilidade(s) salva(s)!`);
      setSelectedDates(new Set());
      await loadSchedule(providerId);
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSlot(slot: AvailabilitySlot) {
    Alert.alert(
      'Remover disponibilidade',
      `Deseja remover ${formatDateBR(slot.data_disponivel.split('T')[0])}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAvailabilitySlot(slot.agenda_id);
              if (providerId) await loadSchedule(providerId);
            } catch (error: any) {
              Alert.alert('Erro', error?.message ?? 'Não foi possível remover.');
            }
          },
        },
      ],
    );
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);
  const todayISO = formatDateISO(today.getFullYear(), today.getMonth(), today.getDate());

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const futureSlots = slots.filter((s) => {
    return s.data_disponivel.split('T')[0] >= todayISO;
  });

  return (
    <ImageBackground
      source={require('../../../../assets/images/fundo_neutro_clean.png')}
      style={styles.screenBg}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Icon name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Minha Agenda</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Calendar */}
          <View style={styles.sectionCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={prevMonth} hitSlop={10}>
                <Icon name="chevron-back" size={22} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity onPress={nextMonth} hitSlop={10}>
                <Icon name="chevron-forward" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((wd) => (
                <Text key={wd} style={styles.weekdayLabel}>{wd}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }
                const dateISO = formatDateISO(currentYear, currentMonth, day);
                const isPast = dateISO < todayISO;
                const isExisting = existingDates.has(dateISO);
                const isSelected = selectedDates.has(dateISO);
                const isToday = dateISO === todayISO;

                return (
                  <TouchableOpacity
                    key={dateISO}
                    style={[
                      styles.dayCell,
                      isToday && styles.dayCellToday,
                      isExisting && styles.dayCellExisting,
                      isSelected && styles.dayCellSelected,
                      isPast && styles.dayCellPast,
                    ]}
                    activeOpacity={0.7}
                    disabled={isPast || isExisting}
                    onPress={() => toggleDate(dateISO)}>
                    <Text
                      style={[
                        styles.dayText,
                        isToday && styles.dayTextToday,
                        isExisting && styles.dayTextExisting,
                        isSelected && styles.dayTextSelected,
                        isPast && styles.dayTextPast,
                      ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>Selecionado</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={styles.legendText}>Cadastrado</Text>
              </View>
            </View>
          </View>

          {/* Time inputs */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Horário de atendimento</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>Início</Text>
                <TextInput
                  style={styles.timeInput}
                  value={startTime}
                  onChangeText={(v) => setStartTime(maskTime(v))}
                  placeholder="08:00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>Fim</Text>
                <TextInput
                  style={styles.timeInput}
                  value={endTime}
                  onChangeText={(v) => setEndTime(maskTime(v))}
                  placeholder="18:00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
            </View>
          </View>

          {selectedDates.size > 0 && (
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              activeOpacity={0.85}
              disabled={saving}
              onPress={handleSave}>
              {saving ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <>
                  <Icon name="calendar-outline" size={20} color={colors.textWhite} />
                  <Text style={styles.saveButtonText}>
                    Salvar {selectedDates.size} dia{selectedDates.size !== 1 ? 's' : ''}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Existing slots */}
          {futureSlots.length > 0 && (
            <View style={styles.slotsSection}>
              <Text style={styles.sectionTitle}>Dias cadastrados</Text>
              {futureSlots.map((slot) => {
                const dateStr = formatDateBR(slot.data_disponivel.split('T')[0]);
                const slotStart = slot.hora_inicio
                  ? new Date(slot.hora_inicio).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'UTC'
                    })
                  : '--:--';
                const slotEnd = slot.hora_fim
                  ? new Date(slot.hora_fim).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'UTC'
                    })
                  : '--:--';

                const statusColor =
                  slot.status === 'Livre'
                    ? colors.success
                    : slot.status === 'Reservado'
                    ? '#F59E0B'
                    : colors.textMuted;

                return (
                  <View key={slot.agenda_id} style={styles.slotCard}>
                    <View style={styles.slotInfo}>
                      <Text style={styles.slotDate}>{dateStr}</Text>
                      <Text style={styles.slotTime}>
                        {slotStart} — {slotEnd}
                      </Text>
                      <View
                        style={[
                          styles.slotStatusPill,
                          { backgroundColor: `${statusColor}20` },
                        ]}>
                        <Text style={[styles.slotStatusText, { color: statusColor }]}>
                          {slot.status}
                        </Text>
                      </View>
                    </View>
                    {slot.status === 'Livre' && (
                      <TouchableOpacity
                        hitSlop={10}
                        onPress={() => handleDeleteSlot(slot)}>
                        <Icon name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <ProviderBottomNavBar activeTab="menu" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screenBg: { flex: 1, backgroundColor: colors.muttedSurface },
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
  },
  screenTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.textDark,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 140, gap: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Shared card (calendar + time)
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  // Calendar
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: colors.textDark,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayCellExisting: {
    backgroundColor: '#D1FAE5',
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellPast: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.textDark,
  },
  dayTextToday: {
    color: colors.primary,
    fontFamily: Fonts.bold,
  },
  dayTextExisting: {
    color: '#047857',
  },
  dayTextSelected: {
    color: colors.textWhite,
    fontFamily: Fonts.bold,
  },
  dayTextPast: {},
  legendRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: colors.textMuted,
  },

  // Time
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: colors.textDark,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeField: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.textMuted,
  },
  timeInput: {
    backgroundColor: colors.surfaceInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: colors.textDark,
  },

  // Save button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 52,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.textWhite,
    fontSize: 15,
    fontFamily: Fonts.bold,
  },

  // Existing slots
  slotsSection: {
    gap: 10,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  slotInfo: {
    flex: 1,
    gap: 4,
  },
  slotDate: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: colors.textDark,
  },
  slotTime: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: colors.textMuted,
  },
  slotStatusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 50,
    marginTop: 4,
  },
  slotStatusText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
  },
});
