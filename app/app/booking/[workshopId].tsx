import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkshopDetail } from '@/hooks/useWorkshops';
import { useCreateBooking } from '@/hooks/useBookings';
import { useLookups } from '@/hooks/useLookups';
import { useStore } from '@/lib/store';
import { SAFETY_RULES } from '@/constants/safety-rules';
import type { AddonCatalog } from '@/types';

export default function BookingFlowScreen() {
  const { workshopId } = useLocalSearchParams<{ workshopId: string }>();
  const router = useRouter();
  const user = useStore((s) => s.user);
  const { timeSlots, addons } = useLookups();
  const { data: workshop, isLoading } = useWorkshopDetail(workshopId);
  const createBooking = useCreateBooking();

  // State
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [showSafety, setShowSafety] = useState(false);
  const [safetyChecks, setSafetyChecks] = useState([false, false, false]);
  const [notes, setNotes] = useState('');

  // Generate next 7 days
  const dates = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
    return days;
  }, []);

  // Check available slots for selected date
  const availableSlotIds = useMemo(() => {
    if (!selectedDate || !workshop?.availability) return new Set<string>();
    return new Set(
      workshop.availability
        .filter(
          (a) =>
            a.is_available &&
            a.available_date.split('T')[0] === selectedDate
        )
        .map((a) => a.time_slot_type_id)
    );
  }, [selectedDate, workshop?.availability]);

  // Pricing
  const basePrice = Number(workshop?.hourly_rate || 0);
  const addonTotal = addons
    .filter((a) => selectedAddons.has(a.id))
    .reduce((sum, a) => sum + Number(a.default_price), 0);
  const totalPrice = basePrice + addonTotal;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSafetyCheck = (index: number) => {
    setSafetyChecks((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const allSafetyChecked = safetyChecks.every(Boolean);

  const handleBook = async () => {
    if (!user?.id || !selectedDate || !selectedSlot) return;

    try {
      await createBooking.mutateAsync({
        bookerId: user.id,
        workshopId,
        timeSlotTypeId: selectedSlot,
        bookingDate: selectedDate,
        addonIds: Array.from(selectedAddons),
        safetyAcknowledged: true,
        notes: notes || undefined,
      });
      Alert.alert('Booking confirmed!', 'Your session has been booked.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Booking failed', err.message);
    }
  };

  if (isLoading || !workshop) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Book a session</Text>
          <View style={{ width: 50 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Workshop summary */}
        <View style={styles.workshopSummary}>
          <Text style={styles.workshopName}>{workshop.name}</Text>
          <Text style={styles.workshopCategory}>{workshop.serviceCategory?.name}</Text>
        </View>

        {/* Date picker — horizontal */}
        <Text style={styles.sectionTitle}>Select a date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {dates.map((d) => (
            <Pressable
              key={d.dateStr}
              style={[styles.dateCard, selectedDate === d.dateStr && styles.dateCardActive]}
              onPress={() => { setSelectedDate(d.dateStr); setSelectedSlot(null); }}
            >
              <Text style={[styles.dateDayName, selectedDate === d.dateStr && styles.dateTextActive]}>
                {d.dayName}
              </Text>
              <Text style={[styles.dateDayNum, selectedDate === d.dateStr && styles.dateTextActive]}>
                {d.dayNum}
              </Text>
              <Text style={[styles.dateMonth, selectedDate === d.dateStr && styles.dateTextActive]}>
                {d.monthName}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Time slot grid */}
        {selectedDate && (
          <>
            <Text style={styles.sectionTitle}>Select a time</Text>
            <View style={styles.slotGrid}>
              {timeSlots.map((slot) => {
                const isAvailable = availableSlotIds.has(slot.id);
                const isSelected = selectedSlot === slot.id;
                return (
                  <Pressable
                    key={slot.id}
                    style={[
                      styles.slotCard,
                      isSelected && styles.slotCardActive,
                      !isAvailable && styles.slotCardDisabled,
                    ]}
                    disabled={!isAvailable}
                    onPress={() => setSelectedSlot(slot.id)}
                  >
                    <Text style={[styles.slotName, isSelected && styles.slotTextActive, !isAvailable && styles.slotTextDisabled]}>
                      {slot.name}
                    </Text>
                    <Text style={[styles.slotTime, isSelected && styles.slotTextActive, !isAvailable && styles.slotTextDisabled]}>
                      {slot.start_time}–{slot.end_time}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Add-ons */}
        <Text style={styles.sectionTitle}>Your Build Setup</Text>
        {addons.map((addon) => (
          <Pressable
            key={addon.id}
            style={[styles.addonCard, selectedAddons.has(addon.id) && styles.addonCardActive]}
            onPress={() => toggleAddon(addon.id)}
          >
            <View style={styles.addonInfo}>
              <Text style={styles.addonName}>{addon.name}</Text>
              <Text style={styles.addonDesc}>{addon.description}</Text>
            </View>
            <View style={styles.addonRight}>
              <Text style={styles.addonPrice}>+${Number(addon.default_price).toFixed(0)}</Text>
              <View style={[styles.addonToggle, selectedAddons.has(addon.id) && styles.addonToggleActive]}>
                {selectedAddons.has(addon.id) && <Text style={styles.addonCheck}>✓</Text>}
              </View>
            </View>
          </Pressable>
        ))}

        {/* Dynamic receipt */}
        <View style={styles.receipt}>
          <Text style={styles.receiptTitle}>Price breakdown</Text>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Base rate ({workshop.serviceCategory?.name})</Text>
            <Text style={styles.receiptValue}>${basePrice.toFixed(2)}</Text>
          </View>
          {addons
            .filter((a) => selectedAddons.has(a.id))
            .map((a) => (
              <View key={a.id} style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>{a.name}</Text>
                <Text style={styles.receiptValue}>${Number(a.default_price).toFixed(2)}</Text>
              </View>
            ))}
          <View style={[styles.receiptRow, styles.receiptTotal]}>
            <Text style={styles.receiptTotalLabel}>Total</Text>
            <Text style={styles.receiptTotalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <SafeAreaView style={styles.ctaContainer} edges={['bottom']}>
        <Pressable
          style={[styles.ctaButton, (!selectedDate || !selectedSlot) && styles.ctaDisabled]}
          disabled={!selectedDate || !selectedSlot}
          onPress={() => setShowSafety(true)}
        >
          <Text style={styles.ctaText}>Review Safety Rules</Text>
        </Pressable>
      </SafeAreaView>

      {/* Safety Modal */}
      <Modal visible={showSafety} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Safety First</Text>
            <Text style={styles.modalSubtitle}>
              Please acknowledge the following rules before booking:
            </Text>

            {SAFETY_RULES.map((rule, i) => (
              <Pressable key={i} style={styles.safetyRow} onPress={() => toggleSafetyCheck(i)}>
                <View style={[styles.checkbox, safetyChecks[i] && styles.checkboxChecked]}>
                  {safetyChecks[i] && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.safetyText}>{rule}</Text>
              </Pressable>
            ))}

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setShowSafety(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalConfirm, !allSafetyChecked && styles.ctaDisabled]}
                disabled={!allSafetyChecked || createBooking.isPending}
                onPress={() => { setShowSafety(false); handleBook(); }}
              >
                <Text style={styles.modalConfirmText}>
                  {createBooking.isPending ? 'Booking...' : 'Book Now'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backText: { fontSize: 18, color: '#000' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20 },
  workshopSummary: { marginBottom: 20 },
  workshopName: { fontSize: 22, fontWeight: '700', color: '#000' },
  workshopCategory: { fontSize: 14, color: '#888', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 12, marginTop: 8 },
  dateRow: { gap: 10, paddingBottom: 16 },
  dateCard: {
    width: 68,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCardActive: { backgroundColor: '#000' },
  dateDayName: { fontSize: 12, color: '#888', fontWeight: '500' },
  dateDayNum: { fontSize: 22, fontWeight: '700', color: '#000', marginVertical: 2 },
  dateMonth: { fontSize: 11, color: '#aaa' },
  dateTextActive: { color: '#fff' },
  slotGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  slotCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  slotCardActive: { backgroundColor: '#000' },
  slotCardDisabled: { backgroundColor: '#fafafa', opacity: 0.5 },
  slotName: { fontSize: 14, fontWeight: '600', color: '#000' },
  slotTime: { fontSize: 11, color: '#888', marginTop: 2 },
  slotTextActive: { color: '#fff' },
  slotTextDisabled: { color: '#ccc' },
  addonCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  addonCardActive: { backgroundColor: '#f0f8ff', borderWidth: 1, borderColor: '#007AFF' },
  addonInfo: { flex: 1, marginRight: 12 },
  addonName: { fontSize: 15, fontWeight: '600', color: '#000' },
  addonDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  addonRight: { alignItems: 'center', gap: 6 },
  addonPrice: { fontSize: 15, fontWeight: '700', color: '#000' },
  addonToggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addonToggleActive: { backgroundColor: '#000', borderColor: '#000' },
  addonCheck: { color: '#fff', fontSize: 14, fontWeight: '700' },
  receipt: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  receiptTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptLabel: { fontSize: 14, color: '#666' },
  receiptValue: { fontSize: 14, color: '#000', fontWeight: '500' },
  receiptTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  receiptTotalLabel: { fontSize: 16, fontWeight: '700', color: '#000' },
  receiptTotalValue: { fontSize: 18, fontWeight: '700', color: '#000' },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaButton: {
    backgroundColor: '#000',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaDisabled: { backgroundColor: '#ccc' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  // Safety Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: '#000', borderColor: '#000' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  safetyText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: '#666' },
  modalConfirm: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  modalConfirmText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
