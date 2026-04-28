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
import { Colors } from '../theme/colors';

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

              <Text style={styles.title}>Projeto finalizado!</Text>
              <Text style={styles.subtitle}>
                Todos os serviços foram concluídos com sucesso. Obrigado pela confiança!
              </Text>

              <View style={styles.infoBanner}>
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color={Colors.textMuted}
                  style={{ marginTop: 1 }}
                />
                <Text style={styles.infoText}>
                  Sua opinião nos ajuda a aprimorar nossos detalhes e garante uma experiência cada vez mais segura e eficiente para você.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.btnAvaliar}
                activeOpacity={0.85}
                onPress={onAvaliar}
              >
                <Text style={styles.btnAvaliarText}>Avaliar Serviço</Text>
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

  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
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
    backgroundColor: Colors.tagBackground,
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
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },

  infoText: {
    flex: 1,
    fontFamily: 'OpenSans_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
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

  btnAvaliarText: {
    fontFamily: 'OpenSans_700Bold',
    fontSize: 15,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
