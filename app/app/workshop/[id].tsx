import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkshopDetail } from '@/hooks/useWorkshops';

const { width } = Dimensions.get('window');

export default function WorkshopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: workshop, isLoading } = useWorkshopDetail(id);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  if (isLoading || !workshop) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Photo Carousel — inspired by peek.png */}
        <View style={styles.heroContainer}>
          <FlatList
            data={workshop.photo_urls}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setActivePhoto(Math.round(e.nativeEvent.contentOffset.x / width))
            }
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.heroImage} />
            )}
          />

          {/* Back button */}
          <SafeAreaView style={styles.heroOverlay} edges={['top']}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
          </SafeAreaView>

          {/* Photo indicators */}
          <View style={styles.indicators}>
            {workshop.photo_urls.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, activePhoto === i && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Content — inspired by peek.png bottom sheet style */}
        <View style={styles.content}>
          <Text style={styles.workshopName}>{workshop.name}</Text>

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{workshop.address || 'Wichita, KS'}</Text>
          </View>

          {/* Description */}
          <Text
            style={styles.description}
            numberOfLines={showFullDescription ? undefined : 3}
          >
            {workshop.description}
          </Text>
          {(workshop.description?.length || 0) > 120 && (
            <Pressable onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.readMore}>
                {showFullDescription ? 'Show less' : 'Read more'}
              </Text>
            </Pressable>
          )}

          {/* Host info */}
          <View style={styles.hostRow}>
            <Image
              source={{ uri: workshop.host?.avatar_url || 'https://via.placeholder.com/48' }}
              style={styles.hostAvatar}
            />
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>Hosted by {workshop.host?.full_name}</Text>
              {workshop.host?.bio && (
                <>
                  <Text
                    style={styles.hostBio}
                    numberOfLines={showFullBio ? undefined : 2}
                  >
                    {workshop.host.bio}
                  </Text>
                  {workshop.host.bio.length > 80 && (
                    <Pressable onPress={() => setShowFullBio(!showFullBio)}>
                      <Text style={styles.bioToggle}>
                        {showFullBio ? 'See less' : 'See more'}
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          </View>

          {/* Equipment tags — like feature pills in peek.png */}
          <Text style={styles.sectionTitle}>Equipment</Text>
          <View style={styles.tagRow}>
            {workshop.equipment?.map((we) => (
              <View key={we.id} style={styles.tag}>
                <Text style={styles.tagText}>{we.equipment.name}</Text>
              </View>
            ))}
          </View>

          {/* Stats row — like beds/baths in peek.png */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>★ {workshop.avg_rating?.toFixed(1) || '—'}</Text>
              <Text style={styles.statLabel}>rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{workshop.total_reviews || 0}</Text>
              <Text style={styles.statLabel}>reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{workshop.equipment?.length || 0}</Text>
              <Text style={styles.statLabel}>tools</Text>
            </View>
          </View>

          {/* Reviews */}
          {workshop.reviews && workshop.reviews.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {workshop.reviews.map((review: any) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image
                      source={{ uri: review.reviewer?.avatar_url || 'https://via.placeholder.com/32' }}
                      style={styles.reviewerAvatar}
                    />
                    <View>
                      <Text style={styles.reviewerName}>{review.reviewer?.full_name}</Text>
                      <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
                    </View>
                  </View>
                  {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                </View>
              ))}
            </>
          )}

          {/* Spacer for bottom CTA */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed bottom CTA — like "Send inquiry" in peek.png */}
      <SafeAreaView style={styles.ctaContainer} edges={['bottom']}>
        <View style={styles.ctaContent}>
          <View>
            <Text style={styles.ctaPrice}>${Number(workshop.hourly_rate).toFixed(0)}</Text>
            <Text style={styles.ctaPriceUnit}>per session</Text>
          </View>
          <Pressable
            style={styles.ctaButton}
            onPress={() => router.push(`/booking/${workshop.id}`)}
          >
            <Text style={styles.ctaButtonText}>Book a session</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroContainer: { position: 'relative' },
  heroImage: { width, height: 300, backgroundColor: '#f0f0f0' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginTop: 8,
  },
  backIcon: { fontSize: 28, fontWeight: '300', color: '#000', marginTop: -2 },
  indicators: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 20 },
  content: {
    padding: 20,
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  workshopName: { fontSize: 24, fontWeight: '700', color: '#000', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  locationIcon: { fontSize: 14, marginRight: 4 },
  locationText: { fontSize: 14, color: '#888' },
  description: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 4 },
  readMore: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 16 },
  hostRow: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginBottom: 20,
  },
  hostAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0e0e0' },
  hostInfo: { marginLeft: 12, flex: 1 },
  hostName: { fontSize: 16, fontWeight: '600', color: '#000' },
  hostBio: { fontSize: 13, color: '#888', marginTop: 4, lineHeight: 19 },
  bioToggle: { fontSize: 13, fontWeight: '600', color: '#000', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  tagText: { fontSize: 13, color: '#444', fontWeight: '500' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#000' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#e0e0e0' },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: '#000' },
  reviewRating: { fontSize: 12, color: '#f5a623' },
  reviewComment: { fontSize: 14, color: '#555', lineHeight: 20 },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaPrice: { fontSize: 22, fontWeight: '700', color: '#000' },
  ctaPriceUnit: { fontSize: 13, color: '#888' },
  ctaButton: {
    backgroundColor: '#000',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  ctaButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
