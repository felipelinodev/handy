import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import Icon from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import colors from '../utils/colors';
import { ProfessionalListItem } from '../services/professionalService';

const CARD_WIDTH = Dimensions.get('window').width * 0.44;
const PROFILE_PLACEHOLDER = require('../assets/fundo_neutro.png');

interface ProfessionalCarouselProps {
  data: ProfessionalListItem[];
}

const ProfessionalCard: React.FC<{ item: ProfessionalListItem }> = ({ item }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/professional/${item.id}` as any)}>
      <View style={styles.imageContainer}>
        <Image
          source={item.photoUrl ? { uri: item.photoUrl } : PROFILE_PLACEHOLDER}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <View style={styles.ratingBadge}>
          <Icon name="star" size={12} color="#FFB800" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.minLabel}>Valor mínimo</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            R$ {item.minPrice.toLocaleString('pt-BR')}
          </Text>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText} numberOfLines={1}>
              {item.category}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ProfessionalCarousel: React.FC<ProfessionalCarouselProps> = ({
  data,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.pillContainer}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Próximos a você</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        nestedScrollEnabled
      >
        {data.map(item => (
          <ProfessionalCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  pillContainer: {
    paddingHorizontal: 24,
    marginBottom: 14,
    alignItems: 'flex-start',

  },
  pill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    color: colors.textWhite,
    fontSize: 10,
    fontFamily: 'OpenSans_600SemiBold',
    letterSpacing: 0.2,
  },
  listContent: {
    paddingLeft: 24,
    paddingRight: 10,
    paddingBottom: 4,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 0.7,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#E0D5F0',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
  cardContent: {
    padding: 12,
  },
  cardName: {
    fontSize: 14,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
    marginBottom: 4,
  },
  minLabel: {
    fontSize: 11,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textMuted,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    fontSize: 15,
    fontFamily: 'OpenSans_700Bold',
    color: colors.primaryDark,
  },
  categoryTag: {
    backgroundColor: "#CBC3F8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    maxWidth: 90,
  },
  categoryTagText: {
    fontSize: 10,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
  },
});
