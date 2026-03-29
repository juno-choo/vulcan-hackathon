import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapboxGL from '@rnmapbox/maps';
import { useWorkshops } from '@/hooks/useWorkshops';
import { useLookups } from '@/hooks/useLookups';
import { theme } from '@/constants/theme';
import type { Workshop } from '@/types';

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN!);

const { width } = Dimensions.get('window');

// Wichita, KS
const DEFAULT_CENTER: [number, number] = [-97.3301, 37.6872];

export default function MapScreen() {
  const router = useRouter();
  const { serviceCategories } = useLookups();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  const { data: workshops = [] } = useWorkshops({
    lat: DEFAULT_CENTER[1],
    lng: DEFAULT_CENTER[0],
    radius: 50,
    category: selectedCategory,
  });

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={process.env.EXPO_PUBLIC_MAPBOX_STYLE || MapboxGL.StyleURL.Street}
      >
        <MapboxGL.Camera
          zoomLevel={12}
          centerCoordinate={DEFAULT_CENTER}
          animationMode="flyTo"
        />

        {workshops.map((ws) =>
          ws.latitude && ws.longitude ? (
            <MapboxGL.PointAnnotation
              key={ws.id}
              id={ws.id}
              coordinate={[ws.longitude, ws.latitude]}
              onSelected={() => setSelectedWorkshop(ws)}
            >
              <View style={styles.pin}>
                <Text style={styles.pinText}>${Number(ws.hourly_rate).toFixed(0)}</Text>
              </View>
            </MapboxGL.PointAnnotation>
          ) : null
        )}
      </MapboxGL.MapView>

      {/* Category filter overlay */}
      <SafeAreaView style={styles.filterOverlay} edges={['top']}>
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
      </SafeAreaView>

      {/* Selected workshop popup */}
      {selectedWorkshop && (
        <Pressable
          style={styles.popup}
          onPress={() => {
            router.push(`/workshop/${selectedWorkshop.id}`);
            setSelectedWorkshop(null);
          }}
        >
          <Image
            source={{ uri: selectedWorkshop.photo_urls[0] || 'https://via.placeholder.com/120x80' }}
            style={styles.popupImage}
          />
          <View style={styles.popupContent}>
            <Text style={styles.popupTitle} numberOfLines={1}>{selectedWorkshop.name}</Text>
            <Text style={styles.popupRating}>
              ★ {selectedWorkshop.avg_rating?.toFixed(1)} · {selectedWorkshop.serviceCategory?.name}
            </Text>
            <View style={styles.popupEquipment}>
              {selectedWorkshop.equipment?.slice(0, 3).map((we) => (
                <Text key={we.id} style={styles.popupEquipText}>{we.equipment.name}</Text>
              ))}
            </View>
            <Text style={styles.popupPrice}>${Number(selectedWorkshop.hourly_rate).toFixed(0)}/hr</Text>
          </View>
          <Pressable style={styles.closeBtn} onPress={() => setSelectedWorkshop(null)}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  pin: {
    backgroundColor: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: theme.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pinText: { color: theme.onPrimary, fontSize: 13, fontWeight: '700' },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  pillRow: { paddingHorizontal: 16, gap: 8, paddingTop: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.96)',
    shadowColor: theme.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pillActive: { backgroundColor: theme.primary },
  pillText: { fontSize: 14, color: theme.textPrimary, fontWeight: '500', lineHeight: 20 },
  pillTextActive: { color: theme.onPrimary },
  popup: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: theme.card,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: theme.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  popupImage: { width: 100, height: 100 },
  popupContent: { flex: 1, padding: 12, justifyContent: 'center' },
  popupTitle: { fontSize: 16, fontWeight: '700', color: theme.textPrimary, lineHeight: 24 },
  popupRating: { fontSize: 13, color: theme.textSecondary, marginTop: 2, lineHeight: 18 },
  popupEquipment: { flexDirection: 'row', gap: 4, marginTop: 4 },
  popupEquipText: { fontSize: 13, color: theme.textSecondary, backgroundColor: theme.surfaceSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, lineHeight: 18 },
  popupPrice: { fontSize: 16, fontWeight: '700', color: theme.primary, marginTop: 4, lineHeight: 24 },
  closeBtn: { position: 'absolute', top: 8, right: 8 },
  closeBtnText: { fontSize: 16, color: theme.textMuted },
});
