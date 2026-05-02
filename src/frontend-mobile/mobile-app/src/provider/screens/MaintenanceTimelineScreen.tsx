import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '../../utils/colors';
import { MaintenanceHeader } from '../components/MaintenanceHeader';
import { TimelineCard } from '../components/TimelineCard';
import {
  CreateBreakpointSheet,
  BreakpointFormResult,
} from '../components/CreateBreakpointSheet';
import {
  mockMaintenanceData,
  FilterOption,
} from '../data/mockMaintenance';
import { Breakpoint } from '../types/provider.types';

const STORAGE_KEY = '@maintenance_breakpoints';

export default function MaintenanceTimelineScreen() {
  const insets = useSafeAreaInsets();
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('Geral');
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        setBreakpoints(JSON.parse(raw));
      } else {
        setBreakpoints(mockMaintenanceData.breakpoints);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(breakpoints));
    }
  }, [breakpoints, loaded]);

  const STATUS_MAP: Record<string, Breakpoint['status']> = {
    Geral: 'pendente',
    Pendente: 'pendente',
    'Em Andamento': 'em_andamento',
    'Concluído': 'concluido',
  };

  function parseDate(dateStr: string): number {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return 0;
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day).getTime();
  }

  const filteredBreakpoints =
    activeFilter === 'Geral'
      ? breakpoints
      : breakpoints.filter((bp) => bp.status === STATUS_MAP[activeFilter]);

  const handleFilterChange = useCallback((filter: FilterOption) => {
    setActiveFilter(filter);
  }, []);

  function handleEdit(bp: Breakpoint) {
    Alert.alert(
      bp.titulo,
      'Alterar status deste breakpoint:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: '✅ Concluído',
          onPress: () =>
            setBreakpoints((prev) =>
              prev.map((item) =>
                item.id === bp.id ? { ...item, status: 'concluido' as const } : item,
              ),
            ),
        },
        {
          text: '🔄 Em Andamento',
          onPress: () =>
            setBreakpoints((prev) =>
              prev.map((item) =>
                item.id === bp.id ? { ...item, status: 'em_andamento' as const } : item,
              ),
            ),
        },
      ],
    );
  }

  function handleSaveBreakpoint(formData: BreakpointFormResult) {
    const newBp: Breakpoint = {
      id: String(Date.now()),
      titulo: formData.titulo,
      descricao: formData.descricao,
      data: formData.data,
      comentarios: [],
      status: 'pendente',
    };
    const newTime = parseDate(newBp.data);
    setBreakpoints((prev) => {
      const index = prev.findIndex((bp) => parseDate(bp.data) > newTime);
      if (index === -1) return [...prev, newBp];
      const copy = [...prev];
      copy.splice(index, 0, newBp);
      return copy;
    });
    setShowSheet(false);
    Alert.alert('Breakpoint criado', `"${formData.titulo}" foi adicionado à timeline.`);
  }

  const totalCount = breakpoints.length;
  const doneCount = breakpoints.filter((b) => b.status === 'concluido').length;

  return (
    <ImageBackground
      source={require('../../assets/fundo_neutro_clean.png')}
      style={styles.background}>
      <ScrollView
        style={[styles.scroll, { paddingTop: insets.top + 8 }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <MaintenanceHeader
          titulo={mockMaintenanceData.titulo}
          subtitulo={mockMaintenanceData.subtitulo}
          contratoId={mockMaintenanceData.contratoId}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        {totalCount > 0 && (
          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {doneCount}/{totalCount} concluídos
            </Text>
          </View>
        )}

        {filteredBreakpoints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Icon name="flag-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Nenhum breakpoint</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'Geral'
                ? 'Crie o primeiro breakpoint para\nacompanhar a manutenção.'
                : `Nenhum breakpoint com status "${activeFilter}".`}
            </Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {filteredBreakpoints.map((bp) => (
              <TimelineCard
                key={bp.id}
                breakpoint={bp}
                alignment="left"
                onEdit={handleEdit}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.fabContainer, { bottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => setShowSheet(true)}>
          <Icon name="add" size={20} color={colors.primary} />
          <Text style={styles.fabText}>Novo Breakpoint</Text>
        </TouchableOpacity>
      </View>

      <CreateBreakpointSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onSave={handleSaveBreakpoint}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.muttedSurface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  timelineContainer: {
    marginTop: 12,
    paddingBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  fabText: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
});
