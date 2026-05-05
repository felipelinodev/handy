import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@expo/vector-icons/Ionicons';

import InputField from '../components/auth/InputField';
import AuthButton from '../components/auth/AuthButton';
import colors from '../utils/colors';
import { isValidEmail } from '../utils/validation';
import {
  Especialidade,
  fetchEspecialidades,
  fetchProfessionalById,
  fetchProviderEspecialidadeIds,
  updateProfessional,
} from '../services/professionalService';
import { EspecialidadePicker } from '../components/common/EspecialidadePicker';
import { useProviderGuard } from '../utils/useProviderGuard';

export default function EditProfessionalProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const guardAllowed = useProviderGuard({ ownerId: id });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [endereco, setEndereco] = useState('');
  const [descricao, setDescricao] = useState('');

  const [nomeError, setNomeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [photoUrlError, setPhotoUrlError] = useState('');

  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!id) return;
      try {
        const [data, allEsp, selectedIds] = await Promise.all([
          fetchProfessionalById(id),
          fetchEspecialidades().catch(() => []),
          fetchProviderEspecialidadeIds(id).catch(() => []),
        ]);
        if (isMounted) {
          setNome(data.name);
          setPhotoUrl(data.photoUrl ?? '');
          setEndereco(data.address ?? '');
          setDescricao(data.description ?? '');
          setEspecialidades(allEsp);
          setSelectedEspecialidades(selectedIds);

          const userDataString = await AsyncStorage.getItem('@auth_user');
          if (userDataString) {
            const u = JSON.parse(userDataString);
            if (u?.email) setEmail(u.email);
          }
        }
      } catch (error: any) {
        Alert.alert('Erro', error?.message ?? 'Não foi possível carregar o perfil.');
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

    if (!nome.trim()) {
      setNomeError('O nome é obrigatório.');
      valid = false;
    } else {
      setNomeError('');
    }

    if (email && !isValidEmail(email)) {
      setEmailError('E-mail inválido.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (photoUrl && !/^https?:\/\/.+/i.test(photoUrl.trim())) {
      setPhotoUrlError('Use uma URL completa (http:// ou https://).');
      valid = false;
    } else {
      setPhotoUrlError('');
    }

    return valid;
  }

  async function handleSave() {
    if (!id || !validate()) return;
    setSaving(true);
    try {
      await updateProfessional(id, {
        nome: nome.trim(),
        email: email.trim() || undefined,
        photo_url: photoUrl.trim() ? photoUrl.trim() : null,
        endereco: endereco.trim() ? endereco.trim() : null,
        descricao: descricao.trim() ? descricao.trim() : null,
        especialidades: selectedEspecialidades,
      });

      const userDataString = await AsyncStorage.getItem('@auth_user');
      if (userDataString) {
        const u = JSON.parse(userDataString);
        const updated = {
          ...u,
          nome: nome.trim(),
          email: email.trim() || u.email,
          photo_url: photoUrl.trim() || null,
          endereco: endereco.trim() || null,
          descricao: descricao.trim() || null,
        };
        await AsyncStorage.setItem('@auth_user', JSON.stringify(updated));
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Não foi possível salvar.');
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
            <Text style={styles.title}>Editar perfil</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.card}>
            <InputField
              placeholder="Nome"
              value={nome}
              onChangeText={(t) => {
                setNome(t);
                if (nomeError) setNomeError('');
              }}
              autoCapitalize="words"
              errorMessage={nomeError}
            />
            <InputField
              placeholder="E-mail"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              errorMessage={emailError}
            />
            <InputField
              placeholder="URL da foto (https://...)"
              value={photoUrl}
              onChangeText={(t) => {
                setPhotoUrl(t);
                if (photoUrlError) setPhotoUrlError('');
              }}
              autoCapitalize="none"
              errorMessage={photoUrlError}
            />
            <InputField
              placeholder="Endereço"
              value={endereco}
              onChangeText={setEndereco}
              autoCapitalize="words"
            />
            <InputField
              placeholder="Descrição / experiência"
              value={descricao}
              onChangeText={setDescricao}
            />

            <View style={styles.chipSection}>
              <Text style={styles.sectionLabel}>Especialidades</Text>
              <EspecialidadePicker
                especialidades={especialidades}
                selectedIds={selectedEspecialidades}
                onChange={setSelectedEspecialidades}
                multi
                placeholder="Selecionar especialidades"
              />
            </View>

            <AuthButton label="Salvar alterações" onPress={handleSave} loading={saving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  chipSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.primary,
  },
  chipTextSelected: {
    color: colors.textWhite,
  },
});
