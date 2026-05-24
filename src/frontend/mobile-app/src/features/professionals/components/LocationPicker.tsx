import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

import colors from '@/theme/colors';
import type { ServiceLocal } from '@/features/professionals/services/professionalService';

type LocalTipo = ServiceLocal['tipo'];

interface Props {
  value: ServiceLocal | null;
  onChange: (local: ServiceLocal) => void;
}

const OPCOES: { tipo: LocalTipo; label: string; desc: string; icon: string }[] = [
  {
    tipo: 'plataforma',
    label: 'Plataforma',
    desc: 'Servico 100% digital, sem deslocamento.',
    icon: 'laptop-outline',
  },
  {
    tipo: 'escolha_cliente',
    label: 'Escolha do cliente',
    desc: 'O cliente define o endereco ao contratar.',
    icon: 'location-outline',
  },
  {
    tipo: 'personalizado',
    label: 'Endereco fixo',
    desc: 'Voce define um endereco fixo de atendimento.',
    icon: 'home-outline',
  },
];

export function LocationPicker({ value, onChange }: Props) {
  const selectedTipo: LocalTipo = value?.tipo ?? 'plataforma';
  const [endereco, setEndereco] = useState(
    value?.tipo === 'personalizado' ? (value as any).endereco ?? '' : '',
  );

  function handleSelect(tipo: LocalTipo) {
    if (tipo === 'personalizado') {
      onChange({ tipo, endereco });
    } else {
      onChange({ tipo } as ServiceLocal);
    }
  }

  function handleEnderecoChange(text: string) {
    setEndereco(text);
    onChange({ tipo: 'personalizado', endereco: text });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Local do servico</Text>

      {OPCOES.map((op) => {
        const active = selectedTipo === op.tipo;
        return (
          <TouchableOpacity
            key={op.tipo}
            style={[styles.option, active && styles.optionActive]}
            activeOpacity={0.7}
            onPress={() => handleSelect(op.tipo)}>
            <Icon
              name={op.icon as any}
              size={20}
              color={active ? colors.primary : colors.textMuted}
            />
            <View style={styles.optionTextWrap}>
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                {op.label}
              </Text>
              <Text style={styles.optionDesc}>{op.desc}</Text>
            </View>
            <View style={[styles.radio, active && styles.radioActive]}>
              {active && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        );
      })}

      {selectedTipo === 'personalizado' && (
        <TextInput
          style={styles.input}
          placeholder="Rua, numero, bairro, cidade"
          placeholderTextColor={colors.textMuted}
          value={endereco}
          onChangeText={handleEnderecoChange}
          maxLength={200}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
    marginBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0E6FF',
  },
  optionTextWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 13,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  optionLabelActive: {
    color: colors.primary,
  },
  optionDesc: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
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
    marginTop: 4,
  },
});
