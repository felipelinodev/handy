import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import colors from '@/theme/colors';
import type { Category } from '@/services/categoryService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 24;
const GRID_GAP = 12;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * 3) / 4;

/** Fallback icon when the category has no icon_tag or an invalid one */
const DEFAULT_ICON = 'grid-outline';

interface CategoryGridProps {
  data: Category[];
  loading?: boolean;
}

const CategoryItem: React.FC<{ item: Category }> = ({ item }) => {
  const router = useRouter();
  const iconName = (item.icon_tag || DEFAULT_ICON) as any;

  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.7}
      onPress={() => {
        router.push({
          pathname: '/search',
          params: { category: item.nome_categoria }
        } as any);
      }}
    >
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={26} color={colors.primary} />
      </View>
      <Text style={styles.itemLabel} numberOfLines={2}>
        {item.nome_categoria}
      </Text>
    </TouchableOpacity>
  );
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ data, loading }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Busque por categorias.</Text>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={styles.grid}>
          {data.map(item => (
            <CategoryItem key={item.categoria_id} item={item} />
          ))}
        </View>
      )}
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
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
