import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import colors from '@/shared/utils/colors';
import { Category } from '@/features/home/data/mockData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 24;
const GRID_GAP = 12;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * 3) / 4;

interface CategoryGridProps {
  data: Category[];
}

const CategoryItem: React.FC<{ item: Category }> = ({ item }) => {
  return (
    <TouchableOpacity style={styles.item} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Icon name={item.icon as any} size={26} color={colors.primary} />
      </View>
      <Text style={styles.itemLabel} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Busque por categorias.</Text>
      <View style={styles.grid}>
        {data.map(item => (
          <CategoryItem key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: GRID_PADDING,
    marginTop: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 18,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  item: {
    width: ITEM_SIZE,
    aspectRatio: 1,
    backgroundColor: '#E6DCF8',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    shadowColor: '#4A1D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconContainer: {
    marginBottom: 6,
  },
  itemLabel: {
    fontSize: 10,
    fontFamily: 'OpenSans_600SemiBold',
    color: colors.textDark,
    textAlign: 'center',
    lineHeight: 13,
  },
});
