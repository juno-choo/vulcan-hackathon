import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '@/lib/store';
import { useUserBookings, useHostBookings } from '@/hooks/useBookings';
import type { Booking, BookingStatus } from '@/types';

const STATUS_TABS: { label: string; value?: BookingStatus }[] = [
  { label: 'All' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  PENDING: { bg: '#FFF3CD', text: '#856404' },
  CONFIRMED: { bg: '#D4EDDA', text: '#155724' },
  COMPLETED: { bg: '#D1ECF1', text: '#0C5460' },
  CANCELLED: { bg: '#F8D7DA', text: '#721C24' },
};

type ViewMode = 'booker' | 'host';

export default function BookingsScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>();
  const isHost = user?.role === 'HOST' || user?.role === 'BOTH';
  const isBooker = user?.role === 'BOOKER' || user?.role === 'BOTH';
  const [viewMode, setViewMode] = useState<ViewMode>(isBooker ? 'booker' : 'host');

  const { data: bookerBookings = [], isLoading: bookerLoading } = useUserBookings(
    viewMode === 'booker' ? (user?.id || '') : '',
    statusFilter
  );
  const { data: hostBookings = [], isLoading: hostLoading } = useHostBookings(
    viewMode === 'host' ? (user?.id || '') : '',
    statusFilter
  );

  const bookings = viewMode === 'booker' ? bookerBookings : hostBookings;
  const isLoading = viewMode === 'booker' ? bookerLoading : hostLoading;

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.screenTitle}>My Bookings</Text>
        <View style={styles.authPrompt}>
          <Text style={styles.authTitle}>Sign in to view bookings</Text>
          <Text style={styles.authSubtitle}>Track your upcoming and past workshop sessions</Text>
          <Pressable style={styles.authButton} onPress={() => router.push('/login')}>
            <Text style={styles.authButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    const colors = STATUS_COLORS[item.status];
    const personLabel = viewMode === 'booker'
      ? item.workshop?.host?.full_name
      : item.booker?.full_name;
    const personAvatar = viewMode === 'booker'
      ? item.workshop?.host?.avatar_url
      : item.booker?.avatar_url;

    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/workshop/${item.workshop_id}`)}
      >
        <Image
          source={{ uri: item.workshop?.photo_urls?.[0] || 'https://via.placeholder.com/80' }}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.workshop?.name || 'Workshop'}</Text>
            <View style={[styles.badge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>{item.status}</Text>
            </View>
          </View>
          {personLabel && (
            <View style={styles.personRow}>
              {personAvatar && (
                <Image source={{ uri: personAvatar }} style={styles.personAvatar} />
              )}
              <Text style={styles.personName}>
                {viewMode === 'booker' ? 'Host: ' : 'Client: '}{personLabel}
              </Text>
            </View>
          )}
          <Text style={styles.cardDate}>
            {formatDate(item.booking_date)} · {item.timeSlotType?.name}
          </Text>
          <Text style={styles.cardPrice}>${Number(item.total_price).toFixed(2)}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle}>My Bookings</Text>

      {/* Role toggle — only show if user has both roles */}
      {isHost && isBooker && (
        <View style={styles.viewToggle}>
          <Pressable
            style={[styles.toggleBtn, viewMode === 'booker' && styles.toggleBtnActive]}
            onPress={() => { setViewMode('booker'); setStatusFilter(undefined); }}
          >
            <Text style={[styles.toggleText, viewMode === 'booker' && styles.toggleTextActive]}>
              My Bookings
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, viewMode === 'host' && styles.toggleBtnActive]}
            onPress={() => { setViewMode('host'); setStatusFilter(undefined); }}
          >
            <Text style={[styles.toggleText, viewMode === 'host' && styles.toggleTextActive]}>
              Incoming
            </Text>
          </Pressable>
        </View>
      )}

      <View style={styles.pillLane}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;

            return (
              <Pressable
                key={tab.label}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setStatusFilter(tab.value)}
              >
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.pillText, isActive && styles.pillTextActive]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {viewMode === 'host' ? 'No incoming bookings' : 'No bookings yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {viewMode === 'host'
                  ? 'Bookings from clients will appear here'
                  : 'Find a workshop to get started'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  screenTitle: { fontSize: 28, fontWeight: '700', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: { backgroundColor: '#000' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#666' },
  toggleTextActive: { color: '#fff' },
  pillLane: { height: 52, justifyContent: 'center' },
  pillRow: { paddingHorizontal: 20, gap: 8, alignItems: 'center', paddingVertical: 4 },
  pill: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pillActive: { backgroundColor: '#000' },
  pillText: {
    fontSize: 13,
    lineHeight: 17,
    color: '#666',
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  pillTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardImage: { width: 90, height: 90 },
  cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#000', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  personRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  personAvatar: { width: 16, height: 16, borderRadius: 8, marginRight: 4 },
  personName: { fontSize: 12, color: '#555', fontWeight: '500' },
  cardDate: { fontSize: 13, color: '#888', marginTop: 3 },
  cardPrice: { fontSize: 16, fontWeight: '700', color: '#000', marginTop: 3 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySubtitle: { fontSize: 14, color: '#999', marginTop: 4 },
  authPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  authTitle: { fontSize: 20, fontWeight: '700', color: '#000' },
  authSubtitle: { fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center' },
  authButton: {
    marginTop: 24,
    backgroundColor: '#000',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  authButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
