import { theme } from "@/constants/theme";
import { useHostBookings, useUserBookings } from "@/hooks/useBookings";
import { useStore } from "@/lib/store";
import type { Booking, BookingStatus } from "@/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_TABS: { label: string; value?: BookingStatus }[] = [
  { label: "All" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  PENDING: { bg: "#FDECC8", text: "#8A6200" },
  CONFIRMED: { bg: "#D8EEE7", text: "#1D6D5A" },
  COMPLETED: { bg: "#DDECF8", text: "#2A5E87" },
  CANCELLED: { bg: "#F8DDE1", text: "#B23A48" },
};

type ViewMode = "booker" | "host";

export default function BookingsScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>();
  const isHost = user?.role === "HOST" || user?.role === "BOTH";
  const isBooker = user?.role === "BOOKER" || user?.role === "BOTH";
  const [viewMode, setViewMode] = useState<ViewMode>(
    isBooker ? "booker" : "host",
  );

  const { data: bookerBookings = [], isLoading: bookerLoading } =
    useUserBookings(viewMode === "booker" ? user?.id || "" : "", statusFilter);
  const { data: hostBookings = [], isLoading: hostLoading } = useHostBookings(
    viewMode === "host" ? user?.id || "" : "",
    statusFilter,
  );

  const bookings = viewMode === "booker" ? bookerBookings : hostBookings;
  const isLoading = viewMode === "booker" ? bookerLoading : hostLoading;

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Text style={styles.screenTitle}>My Bookings</Text>
        <View style={styles.authPrompt}>
          <Text style={styles.authTitle}>Sign in to view bookings</Text>
          <Text style={styles.authSubtitle}>
            Track your upcoming and past workshop sessions
          </Text>
          <Pressable
            style={styles.authButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    const colors = STATUS_COLORS[item.status];
    const personLabel =
      viewMode === "booker"
        ? item.workshop?.host?.full_name
        : item.booker?.full_name;
    const personAvatar =
      viewMode === "booker"
        ? item.workshop?.host?.avatar_url
        : item.booker?.avatar_url;

    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/workshop/${item.workshop_id}`)}
      >
        <Image
          source={{
            uri:
              item.workshop?.photo_urls?.[0] ||
              "https://via.placeholder.com/80",
          }}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.workshop?.name || "Workshop"}
            </Text>
            <View style={[styles.badge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>
                {item.status}
              </Text>
            </View>
          </View>
          {personLabel && (
            <View style={styles.personRow}>
              {personAvatar && (
                <Image
                  source={{ uri: personAvatar }}
                  style={styles.personAvatar}
                />
              )}
              <Text style={styles.personName}>
                {viewMode === "booker" ? "Host: " : "Client: "}
                {personLabel}
              </Text>
            </View>
          )}
          <Text style={styles.cardDate}>
            {formatDate(item.booking_date)} · {item.timeSlotType?.name}
          </Text>
          <Text style={styles.cardPrice}>
            ${Number(item.total_price).toFixed(2)}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.screenTitle}>My Bookings</Text>

      {/* Role toggle — only show if user has both roles */}
      {isHost && isBooker && (
        <View style={styles.viewToggle}>
          <Pressable
            style={[
              styles.toggleBtn,
              viewMode === "booker" && styles.toggleBtnActive,
            ]}
            onPress={() => {
              setViewMode("booker");
              setStatusFilter(undefined);
            }}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === "booker" && styles.toggleTextActive,
              ]}
            >
              My Bookings
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleBtn,
              viewMode === "host" && styles.toggleBtnActive,
            ]}
            onPress={() => {
              setViewMode("host");
              setStatusFilter(undefined);
            }}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === "host" && styles.toggleTextActive,
              ]}
            >
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
                {viewMode === "host"
                  ? "No incoming bookings"
                  : "No bookings yet"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {viewMode === "host"
                  ? "Bookings from clients will appear here"
                  : "Find a workshop to get started"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  screenTitle: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "700",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    color: theme.textPrimary,
  },
  viewToggle: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: theme.surfaceSoft,
    borderRadius: 12,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleBtnActive: { backgroundColor: theme.primary },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textSecondary,
    lineHeight: 20,
  },
  toggleTextActive: { color: theme.onPrimary },
  pillLane: { height: 52, justifyContent: "center" },
  pillRow: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: "center",
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pillActive: { backgroundColor: theme.primary },
  pillText: {
    fontSize: 13,
    lineHeight: 17,
    color: theme.textSecondary,
    fontWeight: "500",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  pillTextActive: { color: theme.onPrimary },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    flexDirection: "row",
    backgroundColor: theme.card,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: theme.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardImage: { width: 90, height: 90 },
  cardContent: { flex: 1, padding: 12, justifyContent: "center" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.textPrimary,
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  personRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  personAvatar: { width: 16, height: 16, borderRadius: 8, marginRight: 4 },
  personName: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: "500",
    lineHeight: 18,
  },
  cardDate: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.primary,
    marginTop: 3,
    lineHeight: 22,
  },
  empty: { alignItems: "center", marginTop: 60 },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: theme.textPrimary,
    lineHeight: 26,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.textMuted,
    marginTop: 4,
    lineHeight: 22,
  },
  authPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.textPrimary,
    lineHeight: 30,
  },
  authSubtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  authButton: {
    marginTop: 24,
    backgroundColor: theme.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  authButtonText: {
    color: theme.onPrimary,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
});
