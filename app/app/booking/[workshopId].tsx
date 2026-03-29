import { SAFETY_RULES } from "@/constants/safety-rules";
import { theme } from "@/constants/theme";
import { useCreateBooking } from "@/hooks/useBookings";
import { useLookups } from "@/hooks/useLookups";
import { useWorkshopSnapshots } from "@/hooks/useSnapshots";
import { useWorkshopDetail } from "@/hooks/useWorkshops";
import { useStore } from "@/lib/store";
import type { Project } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export default function BookingFlowScreen() {
  const { workshopId } = useLocalSearchParams<{ workshopId: string }>();
  const router = useRouter();
  const user = useStore((s) => s.user);
  const { timeSlots, addons } = useLookups();
  const { data: workshop, isLoading } = useWorkshopDetail(workshopId);
  const createBooking = useCreateBooking();
  const { data: workshopProjects = [] } = useWorkshopSnapshots(workshopId);

  // State
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [showSafety, setShowSafety] = useState(false);
  const [safetyChecks, setSafetyChecks] = useState([false, false, false]);
  const [notes, setNotes] = useState("");

  // Generate next 7 days
  const dates = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        dateStr: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
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
            a.is_available && a.available_date.split("T")[0] === selectedDate,
        )
        .map((a) => a.time_slot_type_id),
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
      Alert.alert("Booking confirmed!", "Your session has been booked.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Booking failed", err.message);
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
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Book a session</Text>
          <View style={{ width: 50 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Workshop summary */}
        <View style={styles.workshopSummary}>
          <Text style={styles.workshopName}>{workshop.name}</Text>
          <Text style={styles.workshopCategory}>
            {workshop.serviceCategory?.name}
          </Text>
        </View>

        {/* Date picker — horizontal */}
        <Text style={styles.sectionTitle}>Select a date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}
        >
          {dates.map((d) => (
            <Pressable
              key={d.dateStr}
              style={[
                styles.dateCard,
                selectedDate === d.dateStr && styles.dateCardActive,
              ]}
              onPress={() => {
                setSelectedDate(d.dateStr);
                setSelectedSlot(null);
              }}
            >
              <Text
                style={[
                  styles.dateDayName,
                  selectedDate === d.dateStr && styles.dateTextActive,
                ]}
              >
                {d.dayName}
              </Text>
              <Text
                style={[
                  styles.dateDayNum,
                  selectedDate === d.dateStr && styles.dateTextActive,
                ]}
              >
                {d.dayNum}
              </Text>
              <Text
                style={[
                  styles.dateMonth,
                  selectedDate === d.dateStr && styles.dateTextActive,
                ]}
              >
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
                    <Text
                      style={[
                        styles.slotName,
                        isSelected && styles.slotTextActive,
                        !isAvailable && styles.slotTextDisabled,
                      ]}
                    >
                      {slot.name}
                    </Text>
                    <Text
                      style={[
                        styles.slotTime,
                        isSelected && styles.slotTextActive,
                        !isAvailable && styles.slotTextDisabled,
                      ]}
                    >
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
            style={[
              styles.addonCard,
              selectedAddons.has(addon.id) && styles.addonCardActive,
            ]}
            onPress={() => toggleAddon(addon.id)}
          >
            <View style={styles.addonInfo}>
              <Text style={styles.addonName}>{addon.name}</Text>
              <Text style={styles.addonDesc}>{addon.description}</Text>
            </View>
            <View style={styles.addonRight}>
              <Text style={styles.addonPrice}>
                +${Number(addon.default_price).toFixed(0)}
              </Text>
              <View
                style={[
                  styles.addonToggle,
                  selectedAddons.has(addon.id) && styles.addonToggleActive,
                ]}
              >
                {selectedAddons.has(addon.id) && (
                  <Text style={styles.addonCheck}>✓</Text>
                )}
              </View>
            </View>
          </Pressable>
        ))}

        {/* Dynamic receipt */}
        <View style={styles.receipt}>
          <Text style={styles.receiptTitle}>Price breakdown</Text>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>
              Base rate ({workshop.serviceCategory?.name})
            </Text>
            <Text style={styles.receiptValue}>${basePrice.toFixed(2)}</Text>
          </View>
          {addons
            .filter((a) => selectedAddons.has(a.id))
            .map((a) => (
              <View key={a.id} style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>{a.name}</Text>
                <Text style={styles.receiptValue}>
                  ${Number(a.default_price).toFixed(2)}
                </Text>
              </View>
            ))}
          <View style={[styles.receiptRow, styles.receiptTotal]}>
            <Text style={styles.receiptTotalLabel}>Total</Text>
            <Text style={styles.receiptTotalValue}>
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Snapshot Timeline — past builds at this workshop */}
        {workshopProjects.length > 0 && (
          <View style={styles.timelineSection}>
            <Text style={styles.sectionTitle}>Past Build Logs</Text>
            <Text style={styles.timelineSubtitle}>
              See what others have built here
            </Text>
            {workshopProjects.map((project: Project) => (
              <View key={project.id} style={styles.projectBlock}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                {project.description && (
                  <Text style={styles.projectDesc}>{project.description}</Text>
                )}
                <Text style={styles.projectMeta}>
                  {(project.booking as any)?.booker?.full_name || "A maker"} ·{" "}
                  {project.snapshots?.length || 0} snapshots
                </Text>

                <View style={styles.timeline}>
                  {project.snapshots?.map((snapshot, index) => (
                    <Animated.View
                      key={snapshot.id}
                      entering={FadeInDown.delay(index * 100).duration(400)}
                      style={styles.timelineNode}
                    >
                      <View style={styles.timelineTrack}>
                        <View
                          style={[
                            styles.timelineDot,
                            index === 0 && styles.timelineDotFirst,
                          ]}
                        />
                        {index < (project.snapshots?.length || 0) - 1 && (
                          <View style={styles.timelineLine} />
                        )}
                      </View>

                      <View style={styles.snapshotCard}>
                        <View style={styles.snapshotHeader}>
                          <Text style={styles.snapshotNumber}>
                            Snapshot #{snapshot.sequence_number}
                          </Text>
                          <Text style={styles.snapshotTime}>
                            {timeAgo(snapshot.created_at)}
                          </Text>
                        </View>
                        {snapshot.notes && (
                          <Text style={styles.snapshotNotes}>
                            {snapshot.notes}
                          </Text>
                        )}

                        <View style={styles.photoRow}>
                          <View style={styles.photoContainer}>
                            <Text style={styles.photoLabel}>Before</Text>
                            <Image
                              source={{ uri: snapshot.before_photo_url }}
                              style={styles.photo}
                            />
                          </View>
                          <View style={styles.photoContainer}>
                            <Text style={styles.photoLabel}>After</Text>
                            <Image
                              source={{ uri: snapshot.after_photo_url }}
                              style={styles.photo}
                            />
                          </View>
                        </View>

                        {snapshot.skills && snapshot.skills.length > 0 && (
                          <View style={styles.tagSection}>
                            <Text style={styles.tagLabel}>Skills gained</Text>
                            <View style={styles.tagRow}>
                              {snapshot.skills.map((s) => (
                                <View
                                  key={s.id}
                                  style={[styles.tag, styles.skillTag]}
                                >
                                  <Text
                                    style={[
                                      styles.tagText,
                                      styles.skillTagText,
                                    ]}
                                  >
                                    {s.skill.name}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    </Animated.View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <SafeAreaView style={styles.ctaContainer} edges={["bottom"]}>
        <Pressable
          style={[
            styles.ctaButton,
            (!selectedDate || !selectedSlot) && styles.ctaDisabled,
          ]}
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
              <Pressable
                key={i}
                style={styles.safetyRow}
                onPress={() => toggleSafetyCheck(i)}
              >
                <View
                  style={[
                    styles.checkbox,
                    safetyChecks[i] && styles.checkboxChecked,
                  ]}
                >
                  {safetyChecks[i] && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.safetyText}>{rule}</Text>
              </Pressable>
            ))}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setShowSafety(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalConfirm,
                  !allSafetyChecked && styles.ctaDisabled,
                ]}
                disabled={!allSafetyChecked || createBooking.isPending}
                onPress={() => {
                  setShowSafety(false);
                  handleBook();
                }}
              >
                <Text style={styles.modalConfirmText}>
                  {createBooking.isPending ? "Booking..." : "Book Now"}
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
  container: { flex: 1, backgroundColor: theme.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backText: { fontSize: 18, color: theme.textPrimary },
  headerTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "600",
    color: theme.textPrimary,
  },
  scrollContent: { paddingHorizontal: 20 },
  workshopSummary: { marginBottom: 20 },
  workshopName: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
    color: theme.textPrimary,
  },
  workshopCategory: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "700",
    color: theme.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  dateRow: { gap: 10, paddingBottom: 16 },
  dateCard: {
    width: 68,
    height: 80,
    borderRadius: 16,
    backgroundColor: theme.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dateCardActive: { backgroundColor: theme.primary },
  dateDayName: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  dateDayNum: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
    color: theme.textPrimary,
    marginVertical: 2,
  },
  dateMonth: { fontSize: 13, lineHeight: 18, color: theme.textMuted },
  dateTextActive: { color: theme.onPrimary },
  slotGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  slotCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.surfaceSoft,
    alignItems: "center",
  },
  slotCardActive: { backgroundColor: theme.primary },
  slotCardDisabled: { backgroundColor: theme.surface, opacity: 0.5 },
  slotName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: theme.textPrimary,
  },
  slotTime: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textSecondary,
    marginTop: 2,
  },
  slotTextActive: { color: theme.onPrimary },
  slotTextDisabled: { color: theme.textMuted },
  addonCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: theme.surface,
    marginBottom: 10,
  },
  addonCardActive: {
    backgroundColor: "#EAF3FA",
    borderWidth: 1,
    borderColor: theme.primaryMuted,
  },
  addonInfo: { flex: 1, marginRight: 12 },
  addonName: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: theme.textPrimary,
  },
  addonDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textSecondary,
    marginTop: 2,
  },
  addonRight: { alignItems: "center", gap: 6 },
  addonPrice: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    color: theme.textPrimary,
  },
  addonToggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },
  addonToggleActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  addonCheck: {
    color: theme.onPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  receipt: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  receiptTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  receiptLabel: { fontSize: 14, lineHeight: 20, color: theme.textSecondary },
  receiptValue: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.textPrimary,
    fontWeight: "500",
  },
  receiptTotal: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  receiptTotalLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
    color: theme.textPrimary,
  },
  receiptTotalValue: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "700",
    color: theme.primary,
  },
  // Snapshot timeline styles
  timelineSection: { marginTop: 24 },
  timelineSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
    marginBottom: 16,
    marginTop: -4,
  },
  projectBlock: { marginBottom: 24 },
  projectTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "700",
    color: theme.textPrimary,
    marginBottom: 4,
  },
  projectDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  projectMeta: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
    marginBottom: 12,
  },
  timeline: { paddingLeft: 4 },
  timelineNode: { flexDirection: "row", marginBottom: 16 },
  timelineTrack: { width: 24, alignItems: "center" },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.border,
    borderWidth: 3,
    borderColor: theme.surface,
    zIndex: 1,
  },
  timelineDotFirst: { backgroundColor: theme.primary },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.border,
    marginTop: -2,
  },
  snapshotCard: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
  },
  snapshotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  snapshotNumber: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: theme.textPrimary,
  },
  snapshotTime: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    color: theme.textMuted,
  },
  snapshotNotes: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textSecondary,
    marginBottom: 12,
  },
  photoRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  photoContainer: { flex: 1 },
  photoLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
    fontWeight: "500",
    marginBottom: 4,
  },
  photo: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    backgroundColor: theme.surfaceSoft,
  },
  tagSection: { marginTop: 8 },
  tagLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
    fontWeight: "500",
    marginBottom: 6,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: theme.surfaceSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  skillTag: { backgroundColor: "#D8EEE7" },
  skillTagText: { color: theme.success },
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaButton: {
    backgroundColor: theme.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaDisabled: { backgroundColor: theme.textMuted },
  ctaText: {
    color: theme.onPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },
  // Safety Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  modalSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  safetyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkmark: {
    color: theme.onPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  safetyText: {
    flex: 1,
    fontSize: 14,
    color: theme.textPrimary,
    lineHeight: 20,
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.surfaceSoft,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    color: theme.textSecondary,
  },
  modalConfirm: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.primary,
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    color: theme.onPrimary,
  },
});
