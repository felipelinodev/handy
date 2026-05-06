import React, { useState, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import colors from '../utils/colors';

export interface Especialidade {
  especialidade_id: number;
  nome_especialidade: string;
}

interface SpecialtyPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  especialidades: Especialidade[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export function SpecialtyPickerSheet({
  visible,
  onClose,
  especialidades,
  selectedIds,
  onToggle,
}: SpecialtyPickerSheetProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return especialidades;
    return especialidades.filter((e) => e.nome_especialidade.toLowerCase().includes(q));
  }, [search, especialidades]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <Text style={styles.title}>Especialidades</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                  <Icon name="close" size={24} color={colors.textDark} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Icon name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar especialidade..."
                  placeholderTextColor={colors.textMuted}
                  value={search}
                  onChangeText={setSearch}
                  autoCorrect={false}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Icon name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}>
                {filtered.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhuma especialidade encontrada.</Text>
                ) : (
                  filtered.map((esp) => {
                    const selected = selectedIds.includes(esp.especialidade_id);
                    return (
                      <TouchableOpacity
                        key={esp.especialidade_id}
                        style={styles.item}
                        activeOpacity={0.7}
                        onPress={() => onToggle(esp.especialidade_id)}>
                        <Text style={[styles.itemText, selected && styles.itemTextSelected]}>
                          {esp.nome_especialidade}
                        </Text>
                        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                          {selected && <Icon name="checkmark" size={16} color={colors.white} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.8} onPress={onClose}>
                  <Text style={styles.confirmBtnText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  closeBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.muttedSurface,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
    paddingVertical: 0,
  },
  list: {
    flexShrink: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8FF',
  },
  itemText: {
    fontSize: 15,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
  },
  itemTextSelected: {
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0D5F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3E8FF',
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.white,
  },
});
