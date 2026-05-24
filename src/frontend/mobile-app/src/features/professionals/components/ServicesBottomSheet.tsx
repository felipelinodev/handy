import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/theme/colors';
import { ProfessionalService } from '@/features/professionals/services/professionalService';
import { ServiceCard } from '@/features/professionals/components/ServiceCard';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.78;

interface ServicesBottomSheetProps {
  visible: boolean;
  providerName?: string;
  services: ProfessionalService[];
  onClose: () => void;
  onSelect: (service: ProfessionalService) => void;
}

export const ServicesBottomSheet: React.FC<ServicesBottomSheetProps> = ({
  visible,
  providerName,
  services,
  onClose,
  onSelect,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}>
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

          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Escolha um serviço</Text>
              {!!providerName && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {providerName}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={10}
              activeOpacity={0.7}
              style={styles.closeButton}>
              <Icon name="close" size={20} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          {services.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Esse prestador ainda não cadastrou serviços.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}>
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onPressHire={() => onSelect(service)}
                />
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.muttedSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 8,
  },
  emptyBox: {
    paddingVertical: 32,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textMuted,
    textAlign: 'center',
  },
});
