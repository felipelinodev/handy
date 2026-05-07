import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';
import colors from '@/shared/utils/colors';

interface ProjectFinishedProps {
  visible: boolean;
  onDismiss: () => void;
  onAvaliar: () => void;
}

export const ProjectFinished: React.FC<ProjectFinishedProps> = ({
  visible,
  onDismiss,
  onAvaliar,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark" size={38} color={Colors.purpleMedium} />
              </View>

              <Text style={styles.title}>Serviço realizado!</Text>
              <Text style={styles.subtitle}>
                Todos os serviços foram concluídos com sucesso. Obrigado pela confiança!
              </Text>

              <View style={styles.infoBanner}>
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color={colors.primary}
                  style={{ marginTop: 1 }}
                />
                <Text style={styles.infoText}>
                  Sua opinião nos ajuda a aprimorar nossos detalhes e garante uma experiência cada vez mais segura e eficiente para você.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.buttonSegundary}
                activeOpacity={0.7}
                onPress={onAvaliar}>
                <Text style={styles.buttonText}>Avaliar Serviço</Text>
              </TouchableOpacity>

            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
    color: '#fff',
  },
  buttonSegundary: {
    width: 297.4,
    height: 46,
    backgroundColor: '#6366f1',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#F3EDFE',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.purpleDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },

  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E5D3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },

  subtitle: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 18,
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: '#E4D3FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },

  infoText: {
    flex: 1,
    fontFamily: 'OpenSans_400Regular',
    fontSize: 11,
    color: colors.primary,
    lineHeight: 16,
  },
});
