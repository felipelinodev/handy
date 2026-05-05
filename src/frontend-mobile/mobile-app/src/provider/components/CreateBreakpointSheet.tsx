import React, { useEffect, useRef, useState } from 'react';
import {
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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '../../utils/colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.75;
const MAX_DESCRICAO = 300;

export interface BreakpointFormResult {
  titulo: string;
  descricao: string;
  data: string;
}

interface CreateBreakpointSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: BreakpointFormResult) => void;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export const CreateBreakpointSheet: React.FC<CreateBreakpointSheetProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTitulo('');
      setDescricao('');
      setSelectedDate(new Date());
      setShowDatePicker(false);
      setErrorMsg(null);
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

  function handleDateChange(_event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  }

  function handleSave() {
    if (titulo.trim().length === 0) {
      setErrorMsg('Informe o título do breakpoint.');
      return;
    }
    if (descricao.trim().length === 0) {
      setErrorMsg('Informe a descrição do breakpoint.');
      return;
    }

    setErrorMsg(null);
    onSave({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      data: formatDate(selectedDate),
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

          <Text style={styles.sheetTitle}>Criar Breakpoint</Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <Text style={styles.fieldLabel}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do breakpoint"
              placeholderTextColor={colors.textMuted}
              value={titulo}
              onChangeText={setTitulo}
              maxLength={80}
            />

            <Text style={styles.fieldLabel}>Descrição</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Adicionar descrição..."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              value={descricao}
              onChangeText={setDescricao}
              maxLength={MAX_DESCRICAO}
            />
            <Text style={styles.counter}>
              {descricao.length}/{MAX_DESCRICAO}
            </Text>

            <Text style={styles.fieldLabel}>Data</Text>
            <TouchableOpacity
              style={styles.dateButton}
              activeOpacity={0.7}
              onPress={() => setShowDatePicker(true)}>
              <View style={styles.dateButtonLeft}>
                <Icon
                  name="calendar-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.dateButtonText}>
                  {formatDate(selectedDate)}
                </Text>
              </View>
              <Icon
                name="chevron-forward"
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  locale="pt-BR"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.pickerDoneBtn}
                    onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.pickerDoneText}>Confirmar</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.7}
                onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                activeOpacity={0.85}
                onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
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
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.primary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
    marginBottom: 16,
  },
  textarea: {
    minHeight: 100,
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
    marginTop: 4,
    marginBottom: 16,
    fontSize: 11,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  dateButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateButtonText: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.primary,
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pickerDoneBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pickerDoneText: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
  },
  errorText: {
    marginBottom: 12,
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.error,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: 'OpenSans_700Bold',
    color: colors.primary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textWhite,
  },
});
