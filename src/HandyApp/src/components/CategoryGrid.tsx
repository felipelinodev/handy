import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../theme/colors';
import {Fonts} from '../theme/fonts';
import {Category} from '../data/mockData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 24;
const GRID_GAP = 12;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * 3) / 4;

interface CategoryGridProps {
  data: Category[];
}

const CategoryItem: React.FC<{item: Category}> = ({item}) => {
  return (
    <TouchableOpacity style={styles.item} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Icon name={item.icon as any} size={26} color={Colors.purpleMedium} />
      </View>
      <Text style={styles.itemLabel} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({data}) => {
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
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.categoryBg,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  iconContainer: {
    marginBottom: 6,
  },
  itemLabel: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
  },
});
