import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

import InputField from '../components/auth/InputField';
import AuthButton from '../components/auth/AuthButton';
import colors from '../utils/colors';
import {
  Categoria,
  fetchCategorias,
  fetchServiceById,
  updateService,
  deleteService,
} from '../services/professionalService';
import {
  brlMaskToNumber,
  maskBrlInput,
  numberToBrlMask,
} from '../utils/currency';
import { useProviderGuard } from '../utils/useProviderGuard';

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
    [categorias, categoriaId]
  );

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }
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
          setCategorias(cats);
        }
      } catch (error: any) {
        Alert.alert('Erro', error?.message ?? 'Não foi possível carregar o serviço.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  function validate(): boolean {
    let valid = true;

    if (!nomeServico.trim()) {
      setNomeError('Informe o nome do serviço.');
      valid = false;
    } else {
      setNomeError('');
    }

    const precoNum = brlMaskToNumber(preco);
    if (!preco || precoNum <= 0) {
      setPrecoError('Preço inválido.');
      valid = false;
    } else {
      setPrecoError('');
    }

    if (!categoriaId) {
      setCategoriaError('Selecione uma categoria.');
      valid = false;
    } else {
      setCategoriaError('');
    }

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
      });
      Alert.alert('Sucesso', 'Serviço atualizado com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Não foi possível atualizar o serviço.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || guardAllowed === null || guardAllowed === false) {
    return (
      <ImageBackground source={require('../assets/fundo_neutro_clean.png')} style={styles.background}>
        <View style={[styles.center, { paddingTop: insets.top + 40 }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../assets/fundo_neutro_clean.png')} style={styles.background}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={() => router.back()}>
              <Icon name="chevron-back" size={22} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Editar serviço</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.card}>
            <InputField
              placeholder="Nome do serviço"
              value={nomeServico}
              onChangeText={(t) => {
                setNomeServico(t);
                if (nomeError) setNomeError('');
              }}
              autoCapitalize="words"
              errorMessage={nomeError}
            />
            <InputField
              placeholder="Descrição (opcional)"
              value={descricao}
              onChangeText={setDescricao}
            />
            <InputField
              placeholder="Preço (R$ 0,00)"
              value={preco}
              onChangeText={(t) => {
                setPreco(maskBrlInput(t));
                if (precoError) setPrecoError('');
              }}
              keyboardType="numeric"
              errorMessage={precoError}
            />

            <Text style={styles.sectionLabel}>Categoria</Text>
            {categorias.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma categoria disponível.</Text>
            ) : (
              <TouchableOpacity
                style={[styles.selector, !!categoriaError && styles.selectorError]}
                activeOpacity={0.7}
                onPress={() => {
                  setCategoriaModalOpen(true);
                  setSearchQuery('');
                }}>
                <Text style={selectedCategoria ? styles.selectorValue : styles.selectorPlaceholder}>
                  {selectedCategoria ? selectedCategoria.nome_categoria : 'Selecionar categoria'}
                </Text>
                <Icon name="chevron-down" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
            {!!categoriaError && <Text style={styles.errorText}>{categoriaError}</Text>}

            <View style={{ marginTop: 16 }}>
              <AuthButton label="Salvar alterações" onPress={handleSave} loading={saving} />
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              activeOpacity={0.7}
              disabled={deleting}
              onPress={() => {
                Alert.alert(
                  'Excluir serviço',
                  'Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Excluir',
                      style: 'destructive',
                      onPress: async () => {
                        if (!id) return;
                        setDeleting(true);
                        try {
                          await deleteService(id);
                          Alert.alert('Sucesso', 'Serviço excluído com sucesso.', [
                            { text: 'OK', onPress: () => router.back() },
                          ]);
                        } catch (error: any) {
                          Alert.alert('Erro', error?.message ?? 'Não foi possível excluir o serviço.');
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
                  <Text style={styles.deleteButtonText}>Excluir serviço</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
              <TouchableOpacity
                onPress={() => setCategoriaModalOpen(false)}
                hitSlop={10}
                activeOpacity={0.7}>
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
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhuma categoria encontrada.</Text>
              }
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
  flex: { flex: 1 },
  background: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  card: {
    backgroundColor: colors.muttedSurface,
    borderRadius: 24,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
    marginBottom: 10,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    fontFamily: 'OpenSans_600SemiBold',
    marginTop: 6,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'OpenSans_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 24,
  },
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.error,
  },
});
