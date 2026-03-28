import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWorkshops } from '@/hooks/useWorkshops';
import { useLookups } from '@/hooks/useLookups';
import type { Workshop } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

// Wichita, KS center
const DEFAULT_LAT = 37.6872;
const DEFAULT_LNG = -97.3301;

export default function HomeScreen() {
  const router = useRouter();
  const { serviceCategories } = useLookups();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data: workshops = [], isLoading, refetch } = useWorkshops({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    radius: 50,
    category: selectedCategory,
  });

  const renderWorkshopCard = ({ item }: { item: Workshop }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/workshop/${item.id}`)}
    >
      <Image
        source={{ uri: item.photo_urls[0] || 'https://via.placeholder.com/400x250' }}
        style={styles.cardImage}
      />
      <View style={styles.cardOverlay}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>★ {item.avg_rating?.toFixed(1) || '—'}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.serviceCategory?.name} · {item.address?.split(',')[1]?.trim() || 'Wichita, KS'}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.equipmentRow}>
            {item.equipment?.slice(0, 3).map((we) => (
              <View key={we.id} style={styles.equipmentPill}>
                <Text style={styles.equipmentPillText}>{we.equipment.name}</Text>
              </View>
            ))}
            {(item.equipment?.length || 0) > 3 && (
              <Text style={styles.moreText}>+{(item.equipment?.length || 0) - 3}</Text>
            )}
          </View>
          <Text style={styles.price}>${Number(item.hourly_rate).toFixed(0)}<Text style={styles.priceUnit}>/hr</Text></Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header — inspired by home.png */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Start your</Text>
          <Text style={styles.title}>workshop search</Text>
        </View>
        <Pressable style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙</Text>
        </Pressable>
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        <Pressable
          style={[styles.pill, !selectedCategory && styles.pillActive]}
          onPress={() => setSelectedCategory(undefined)}
        >
          <Text style={[styles.pillText, !selectedCategory && styles.pillTextActive]}>All</Text>
        </Pressable>
        {serviceCategories.map((cat) => (
          <Pressable
            key={cat.id}
            style={[styles.pill, selectedCategory === cat.id && styles.pillActive]}
            onPress={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
          >
            <Text style={[styles.pillText, selectedCategory === cat.id && styles.pillTextActive]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Workshop Cards */}
      <FlatList
        data={workshops}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkshopCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No workshops found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: { fontSize: 28, fontWeight: '300', color: '#000' },
  title: { fontSize: 28, fontWeight: '700', color: '#000' },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: { fontSize: 20 },
  pillRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 16 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  pillActive: { backgroundColor: '#000' },
  pillText: { fontSize: 14, color: '#666', fontWeight: '500' },
  pillTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  cardOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  ratingBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#000' },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#888', marginBottom: 12 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equipmentRow: { flexDirection: 'row', gap: 6, flexShrink: 1 },
  equipmentPill: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  equipmentPillText: { fontSize: 11, color: '#555', fontWeight: '500' },
  moreText: { fontSize: 12, color: '#999', alignSelf: 'center' },
  price: { fontSize: 20, fontWeight: '700', color: '#000' },
  priceUnit: { fontSize: 14, fontWeight: '400', color: '#888' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySubtitle: { fontSize: 14, color: '#999', marginTop: 4 },
});
