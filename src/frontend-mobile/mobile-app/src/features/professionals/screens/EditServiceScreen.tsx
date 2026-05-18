import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/Ionicons';

import colors from '@/theme/colors';
import { HandyIcon } from '@/shared/components/HandyIcon';
import {
  Categoria,
  fetchCategorias,
  fetchServiceById,
  updateService,
  deleteService,
  type ServiceLocal,
} from '@/features/professionals/services/professionalService';
import { brlMaskToNumber, maskBrlInput, numberToBrlMask } from '@/shared/utils/currency';
import { useProviderGuard } from '@/shared/hooks/useProviderGuard';
import { LocationPicker } from '@/features/professionals/components/LocationPicker';

export default function EditServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const guardAllowed = useProviderGuard();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [nomeServico, setNomeServico] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [local, setLocal] = useState<ServiceLocal>({ tipo: 'plataforma' });

  const [nomeError, setNomeError] = useState('');
  const [precoError, setPrecoError] = useState('');
  const [categoriaError, setCategoriaError] = useState('');

  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategorias = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categorias;
    return categorias.filter((c) => c.nome_categoria.toLowerCase().includes(q));
  }, [searchQuery, categorias]);

  const selectedCategoria = useMemo(
    () => categorias.find((c) => c.categoria_id === categoriaId) ?? null,
    [categorias, categoriaId],
  );

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!id) { setLoading(false); return; }
      try {
        const [service, cats] = await Promise.all([
          fetchServiceById(id),
          fetchCategorias().catch(() => []),
        ]);
        if (isMounted) {
          setNomeServico(service.nome_servico);
          setDescricao(service.descricao ?? '');
          setPreco(numberToBrlMask(service.preco));
          setCategoriaId(service.categoria_id);
          if (service.local) setLocal(service.local);
          setCategorias(cats);
        }
      } catch (error: any) {
        Alert.alert('Erro', error?.message ?? 'Nao foi possivel carregar o servico.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [id]);

  function validate(): boolean {
    let valid = true;
    if (!nomeServico.trim()) { setNomeError('Informe o nome do servico.'); valid = false; }
    else { setNomeError(''); }
    const precoNum = brlMaskToNumber(preco);
    if (!preco || precoNum <= 0) { setPrecoError('Preco invalido.'); valid = false; }
    else { setPrecoError(''); }
    if (!categoriaId) { setCategoriaError('Selecione uma categoria.'); valid = false; }
    else { setCategoriaError(''); }
    return valid;
  }

  async function handleSave() {
    if (!id || !validate()) return;
    setSaving(true);
    try {
      await updateService(id, {
        categoria_id: categoriaId as number,
        nome_servico: nomeServico.trim(),
        descricao: descricao.trim() || null,
        preco: brlMaskToNumber(preco),
        local: local.tipo === 'personalizado' && !local.endereco?.trim() ? null : local,
      });
      Alert.alert('Sucesso', 'Servico atualizado com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Nao foi possivel atualizar o servico.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || guardAllowed === null || guardAllowed === false) {
    return (
      <ImageBackground source={require('../../../../assets/images/fundo_neutro_clean.png')} style={styles.background}>
        <View style={[styles.center, { paddingTop: insets.top + 40 }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../../../../assets/images/fundo_neutro_clean.png')} style={styles.background}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={() => router.back()}>
          <Icon name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar servico</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Informacoes basicas */}
          <Text style={styles.sectionTitle}>Informacoes basicas</Text>
          <Text style={styles.sectionHelper}>Nome, descricao e preco do servico.</Text>

          <View style={styles.inputCard}>
            <View style={styles.inputRow}>
              <Icon name="briefcase-outline" size={18} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Nome do servico"
                placeholderTextColor={colors.textMuted}
                value={nomeServico}
                onChangeText={(t) => { setNomeServico(t); if (nomeError) setNomeError(''); }}
                autoCapitalize="words"
              />
            </View>
            {!!nomeError && <Text style={styles.errorUnder}>{nomeError}</Text>}

            <View style={styles.divider} />

            <View style={styles.inputRowDesc}>
              <Icon name="document-text-outline" size={18} color={colors.primary} style={[styles.inputIcon, styles.inputIconTop]} />
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                placeholder="Descricao (opcional)"
                placeholderTextColor={colors.textMuted}
                value={descricao}
                onChangeText={setDescricao}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.inputRow}>
              <Icon name="cash-outline" size={18} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Preco (R$ 0,00)"
                placeholderTextColor={colors.textMuted}
                value={preco}
                onChangeText={(t) => { setPreco(maskBrlInput(t)); if (precoError) setPrecoError(''); }}
                keyboardType="numeric"
              />
            </View>
            {!!precoError && <Text style={styles.errorUnder}>{precoError}</Text>}
          </View>

          {/* Categoria */}
          <Text style={styles.sectionTitle}>Categoria</Text>
          <Text style={styles.sectionHelper}>Selecione a area do servico.</Text>

          {categorias.length === 0 ? (
            <Text style={styles.emptyHint}>Nenhuma categoria disponivel.</Text>
          ) : (
            <TouchableOpacity
              style={[styles.selector, !!categoriaError && styles.selectorError]}
              activeOpacity={0.7}
              onPress={() => { setCategoriaModalOpen(true); setSearchQuery(''); }}>
              <View style={styles.selectorLeft}>
                <Icon name="pricetag-outline" size={18} color={selectedCategoria ? colors.primary : colors.textMuted} />
                <Text style={selectedCategoria ? styles.selectorValue : styles.selectorPlaceholder}>
                  {selectedCategoria ? selectedCategoria.nome_categoria : 'Selecionar categoria'}
                </Text>
              </View>
              <Icon name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          {!!categoriaError && <Text style={styles.errorText}>{categoriaError}</Text>}

          {/* Local */}
          <LocationPicker value={local} onChange={setLocal} />

          {/* Botoes */}
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={saving}>
            {saving ? (
              <ActivityIndicator color={colors.textWhite} />
            ) : (
              <>
                <HandyIcon name="hugeicons:agreement-02" size={20} color={colors.textWhite} />
                <Text style={styles.saveButtonText}>Salvar alteracoes</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            activeOpacity={0.7}
            disabled={deleting}
            onPress={() => {
              Alert.alert(
                'Excluir servico',
                'Tem certeza que deseja excluir este servico? Esta acao nao pode ser desfeita.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Excluir', style: 'destructive',
                    onPress: async () => {
                      if (!id) return;
                      setDeleting(true);
                      try {
                        await deleteService(id);
                        Alert.alert('Sucesso', 'Servico excluido com sucesso.', [
                          { text: 'OK', onPress: () => router.back() },
                        ]);
                      } catch (error: any) {
                        Alert.alert('Erro', error?.message ?? 'Nao foi possivel excluir o servico.');
                      } finally {
                        setDeleting(false);
                      }
                    },
                  },
                ],
              );
            }}>
            {deleting ? (
              <ActivityIndicator color={colors.error} size="small" />
            ) : (
              <>
                <Icon name="trash-outline" size={18} color={colors.error} />
                <Text style={styles.deleteButtonText}>Excluir servico</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Modal Categoria */}
      <Modal
        visible={categoriaModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setCategoriaModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolher categoria</Text>
              <TouchableOpacity onPress={() => setCategoriaModalOpen(false)} hitSlop={10} activeOpacity={0.7}>
                <Icon name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <Icon name="search" size={18} color={colors.textMuted} />
              <TextInput
                placeholder="Buscar categoria"
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                autoCorrect={false}
              />
              {!!searchQuery && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
                  <Icon name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={filteredCategorias}
              keyExtractor={(item) => String(item.categoria_id)}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma categoria encontrada.</Text>}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const selected = item.categoria_id === categoriaId;
                return (
                  <TouchableOpacity
                    style={styles.optionRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      setCategoriaId(item.categoria_id);
                      if (categoriaError) setCategoriaError('');
                      setCategoriaModalOpen(false);
                    }}>
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {item.nome_categoria}
                    </Text>
                    {selected && <Icon name="checkmark" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.muttedSurface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Top bar
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 12,
  },
  iconButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FAF5FF',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 18, fontFamily: 'OpenSans_700Bold', color: colors.textDark },

  // Sheet (ocupa o resto da tela)
  sheet: {
    flex: 1,
    backgroundColor: colors.surfaceInput,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center', width: 44, height: 5, borderRadius: 3,
    backgroundColor: '#E0DDF7', marginBottom: 16,
  },
  sheetScroll: { flex: 1 },
  sheetContent: { paddingBottom: 8 },

  // Sections
  sectionTitle: { fontSize: 14, fontFamily: 'OpenSans_700Bold', color: colors.textDark, marginBottom: 2 },
  sectionHelper: { fontSize: 12, fontFamily: 'OpenSans_400Regular', color: colors.textMuted, marginBottom: 10 },

  // Input card
  inputCard: {
    backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 18,
    shadowColor: '#4A1D96', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  inputRowDesc: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  inputIcon: { width: 22, textAlign: 'center' },
  inputIconTop: { marginTop: 2 },
  textInput: { flex: 1, fontSize: 14, fontFamily: 'OpenSans_400Regular', color: colors.textDark, padding: 0 },
  textAreaInput: { minHeight: 80, paddingTop: 0 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 46 },
  errorUnder: { fontSize: 12, fontFamily: 'OpenSans_600SemiBold', color: colors.error, paddingHorizontal: 14, paddingBottom: 10 },

  // Selector
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1.5, borderColor: colors.border, marginBottom: 18,
  },
  selectorError: { borderColor: colors.error },
  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  selectorPlaceholder: { fontSize: 14, color: colors.textMuted, fontFamily: 'OpenSans_400Regular' },
  selectorValue: { fontSize: 14, color: colors.textDark, fontFamily: 'OpenSans_600SemiBold' },
  emptyHint: { fontSize: 13, color: colors.textMuted, fontFamily: 'OpenSans_400Regular', fontStyle: 'italic', textAlign: 'center', paddingVertical: 16 },
  errorText: { fontSize: 12, fontFamily: 'OpenSans_600SemiBold', color: colors.error, marginTop: -12, marginBottom: 12 },

  // Save button
  saveButton: {
    marginTop: 8, height: 50, borderRadius: 14, backgroundColor: colors.primary,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  saveButtonText: { color: colors.textWhite, fontSize: 15, fontFamily: 'OpenSans_700Bold' },

  // Delete button
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 14, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.error, backgroundColor: '#FEF2F2',
  },
  deleteButtonText: { fontSize: 14, fontFamily: 'OpenSans_700Bold', color: colors.error },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 8, maxHeight: '80%' },
  modalHandle: { width: 44, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: 'OpenSans_700Bold', color: colors.textDark },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceInput, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'OpenSans_400Regular', color: colors.textDark, padding: 0 },
  emptyText: { fontSize: 13, color: colors.textMuted, fontFamily: 'OpenSans_400Regular', fontStyle: 'italic', textAlign: 'center', paddingVertical: 24 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  optionText: { fontSize: 15, fontFamily: 'OpenSans_400Regular', color: colors.textDark },
  optionTextSelected: { color: colors.primary, fontFamily: 'OpenSans_700Bold' },
  separator: { height: 1, backgroundColor: colors.border },
});
