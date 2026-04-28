import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface RateServiceProps {
  visible: boolean;
  onDismiss: () => void;
  prestadorNome?: string;
}

export const RateService: React.FC<RateServiceProps> = ({
  visible,
  onDismiss,
  prestadorNome,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClose() {
    setRating(0);
    setComment('');
    onDismiss();
  }

  function handleSubmit() {
    if (rating === 0) {
      Alert.alert(
        'Estrelas obrigatórias',
        'Por favor, selecione pelo menos uma estrela para avaliar o serviço.',
      );
      return;
    }

    Alert.alert(
      'Em breve',
      'A funcionalidade de avaliação estará disponível em breve.',
      [{ text: 'OK', onPress: handleClose }],
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.kavWrapper}
            >
              <View style={styles.sheet}>
                <View style={styles.handle} />

                <Text style={styles.title}>
                  Oque você achou do{'\n'}serviço{prestadorNome ? ` de\n${prestadorNome}` : ''}?
                </Text>

                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      activeOpacity={0.7}
                      style={styles.starBtn}
                    >
                      <FontAwesome
                        name={star <= rating ? 'star' : 'star-o'}
                        size={38}
                        color={star <= rating ? Colors.purpleMedium : Colors.purpleSoft}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {rating > 0 && (
                  <Text style={styles.ratingLabel}>
                    {['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente!'][rating]}
                  </Text>
                )}

                <TextInput
                  style={styles.textInput}
                  placeholder="Conte em mais detalhes oque você achou do serviço"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={4}
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.btnAvaliar, isSubmitting && styles.btnDisabled]}
                  activeOpacity={0.85}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.btnAvaliarText}>Avaliar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },

  kavWrapper: {
    width: '100%',
  },

  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: Colors.purpleDark,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.purpleSoft,
    marginBottom: 24,
  },

  title: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 24,
  },

  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },

  starBtn: {
    padding: 4,
  },

  ratingLabel: {
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 13,
    color: Colors.purpleMedium,
    marginBottom: 6,
  },

  textInput: {
    width: '100%',
    minHeight: 110,
    borderWidth: 1.5,
    borderColor: '#E9E3F8',
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    marginBottom: 22,
    fontFamily: 'OpenSans_400Regular',
    fontSize: 13,
    color: Colors.textPrimary,
    backgroundColor: '#FAFAFE',
  },

  btnAvaliar: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.purpleMedium,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.purpleDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  btnDisabled: {
    opacity: 0.6,
  },

  btnAvaliarText: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 15,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
