import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/theme/colors';
import { HandyIcon } from '@/shared/components/HandyIcon';
import { createReview } from '@/features/professionals/services/reviewService';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.65;

interface RateServiceProps {
  visible: boolean;
  onDismiss: () => void;
  contratacaoId?: number;
  prestadorId?: number;
  clienteId?: number;
  prestadorNome?: string;
}

export const RateService: React.FC<RateServiceProps> = ({
  visible,
  onDismiss,
  contratacaoId,
  prestadorId,
  clienteId,
  prestadorNome,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setRating(0);
      setComment('');
      setShowThankYou(false);
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

  function handleClose() {
    setRating(0);
    setComment('');
    setShowThankYou(false);
    onDismiss();
  }

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert(
        'Estrelas obrigatórias',
        'Por favor, selecione pelo menos uma estrela para avaliar o serviço.',
      );
      return;
    }

    if (!contratacaoId || !prestadorId || !clienteId) {
      Alert.alert('Erro', 'Dados do contrato incompletos para criar a avaliação.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        contratacao_id: contratacaoId,
        prestador_id: prestadorId,
        cliente_id: clienteId,
        nota: rating,
        comentario: comment.trim() || undefined,
      });

      setShowThankYou(true);
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Não foi possível enviar a avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: SHEET_MAX_HEIGHT,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handle} />

          {showThankYou ? (
            <View style={styles.thankYouContainer}>
              <View style={styles.thankYouIcon}>
                <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
              </View>
              <Text style={styles.thankYouTitle}>Obrigado!</Text>
              <Text style={styles.thankYouSubtitle}>
                Sua avaliação foi enviada com sucesso. Agradecemos pelo seu feedback!
              </Text>
              <TouchableOpacity
                style={styles.confirmButton}
                activeOpacity={0.85}
                onPress={handleClose}
              >
                <Text style={styles.confirmButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.title}>
                Oque você achou do{'\n'}serviço{prestadorNome ? `?` : '?'}
              </Text>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                    style={styles.starBtn}
                  >
                    <HandyIcon
                      name={star <= rating ? 'solar:star-bold' : 'solar:star-line-duotone'}
                      size={38}
                      color={star <= rating ? colors.primary : colors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.textInput}
                placeholder="Conte em mais detalhes oque você achou do serviço"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
                maxLength={500}
              />

              <TouchableOpacity
                style={[styles.confirmButton, isSubmitting && styles.btnDisabled]}
                activeOpacity={0.85}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.textWhite} />
                ) : (
                  <Text style={styles.confirmButtonText}>Avaliar</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
    paddingBottom: 32,
    alignItems: 'center',
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
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
    paddingTop: 20
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  starBtn: {
    padding: 4,
  },
  textInput: {
    width: '100%',
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
    marginBottom: 18,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.textWhite,
    fontSize: 15,
    fontFamily: 'OpenSans_700Bold',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  thankYouContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    width: '100%'
  },
  thankYouIcon: {
    marginBottom: 16,
  },
  thankYouTitle: {
    fontSize: 22,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginBottom: 10,
  },
  thankYouSubtitle: {
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
});
