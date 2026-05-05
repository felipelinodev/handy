import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '../../utils/colors';
import { Especialidade } from '../../services/professionalService';

interface EspecialidadePickerProps {
  especialidades: Especialidade[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  multi?: boolean;
  placeholder?: string;
  errorMessage?: string;
  emptyHint?: string;
}

export const EspecialidadePicker: React.FC<EspecialidadePickerProps> = ({
  especialidades,
  selectedIds,
  onChange,
  multi = true,
  placeholder = 'Selecionar especialidade',
  errorMessage,
  emptyHint = 'Nenhuma especialidade cadastrada.',
}) => {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return especialidades;
    return especialidades.filter((e) =>
      e.nome_especialidade.toLowerCase().includes(q),
    );
  }, [query, especialidades]);

  const selectedList = useMemo(
    () => especialidades.filter((e) => selectedIds.includes(e.especialidade_id)),
    [especialidades, selectedIds],
  );

  function toggle(id: number) {
    if (multi) {
      const next = selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id];
      onChange(next);
    } else {
      onChange([id]);
      setOpen(false);
    }
  }

  function remove(id: number) {
    onChange(selectedIds.filter((x) => x !== id));
  }

  return (
    <View>
      <TouchableOpacity
        style={[styles.selector, !!errorMessage && styles.selectorError]}
        activeOpacity={0.7}
        onPress={() => {
          setQuery('');
          setOpen(true);
        }}>
        <Text
          style={
            selectedList.length > 0 ? styles.selectorValue : styles.selectorPlaceholder
          }>
          {selectedList.length === 0
            ? especialidades.length === 0
              ? emptyHint
              : placeholder
            : multi
              ? `${selectedList.length} selecionada${selectedList.length > 1 ? 's' : ''}`
              : selectedList[0].nome_especialidade}
        </Text>
        <Icon name="chevron-down" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {multi && selectedList.length > 0 && (
        <View style={styles.chipsRow}>
          {selectedList.map((e) => (
            <View key={e.especialidade_id} style={styles.chip}>
              <Text style={styles.chipText}>{e.nome_especialidade}</Text>
              <TouchableOpacity
                hitSlop={8}
                onPress={() => remove(e.especialidade_id)}>
                <Icon name="close" size={14} color={colors.textWhite} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {multi ? 'Suas especialidades' : 'Escolher especialidade'}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={10} activeOpacity={0.7}>
                <Icon name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Icon name="search" size={18} color={colors.textMuted} />
              <TextInput
                placeholder="Buscar especialidade"
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
                autoCorrect={false}
              />
              {!!query && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
                  <Icon name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.especialidade_id)}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhuma especialidade encontrada.</Text>
              }
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const selected = selectedIds.includes(item.especialidade_id);
                return (
                  <TouchableOpacity
                    style={styles.optionRow}
                    activeOpacity={0.7}
                    onPress={() => toggle(item.especialidade_id)}>
                    <Text
                      style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {item.nome_especialidade}
                    </Text>
                    {selected && <Icon name="checkmark" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />

            {multi && (
              <TouchableOpacity
                style={styles.doneButton}
                activeOpacity={0.85}
                onPress={() => setOpen(false)}>
                <Text style={styles.doneButtonText}>Concluir</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  selectorError: {
    borderColor: colors.error,
  },
  selectorPlaceholder: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'OpenSans_400Regular',
  },
  selectorValue: {
    fontSize: 14,
    color: colors.textDark,
    fontFamily: 'OpenSans_600SemiBold',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    fontFamily: 'OpenSans_600SemiBold',
    marginTop: 6,
    marginLeft: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textWhite,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceInput,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
    padding: 0,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'OpenSans_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 24,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
  },
  optionTextSelected: {
    color: colors.primary,
    fontFamily: 'OpenSans_700Bold',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  doneButton: {
    marginTop: 12,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: colors.textWhite,
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
  },
});
