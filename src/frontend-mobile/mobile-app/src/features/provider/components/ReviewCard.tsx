import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/theme/colors';

export default function ReviewCard({ review }: { review: any }) {
  const nota = review.nota || review.rating || 0;
  const starsArray = [1, 2, 3, 4, 5];

  const authorName = review.cliente?.usuario?.nome || review.author || 'Cliente Oculto';
  const comment = review.comentario || review.comment || '';
  const dateStr = review.created_at || review.date;
  
  const formatDate = (dateValue: string) => {
    if(!dateValue) return '';
    if(dateValue.includes('de')) return dateValue;
    return new Date(dateValue).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Image
            source={review.authorAvatar ?? require('../../../../assets/images/favicon.png')}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <Text style={styles.authorName}>{authorName}</Text>
        </View>
        <View style={styles.starsRow}>
          {starsArray.map((star, index) => (
            <Ionicons 
              key={index} 
              name={index < nota ? "star" : "star-outline"} 
              size={14} 
              color={colors.primary} 
            />
          ))}
        </View>
      </View>
      
      <Text style={styles.comment}>{comment}</Text>
      
      <Text style={styles.date}>{formatDate(dateStr)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#eee'
  },
  authorName: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    color: colors.textDark,
  },
  starsRow: {
    flexDirection: 'row',
  },
  comment: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 14,
    color: colors.textDark,
    lineHeight: 22,
    marginBottom: 16,
  },
  date: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right'
  }
});
