import { theme } from "@/constants/theme";
import { useWorkshopSnapshots } from "@/hooks/useSnapshots";
import { useWorkshopDetail } from "@/hooks/useWorkshops";
import { useStore } from "@/lib/store";
import type { Project } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
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

const { width } = Dimensions.get("window");

export default function WorkshopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: workshop, isLoading } = useWorkshopDetail(id);
  const { data: workshopProjects = [] } = useWorkshopSnapshots(id);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { user } = useStore();
  if (isLoading || !workshop) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleBookSession = () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    router.push(`/booking/${workshop.id}`);
  };

  if (showAuthPrompt && !user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Text style={styles.screenTitle}>Book A Session</Text>
        <View style={styles.authPrompt}>
          <Text style={styles.authTitle}>Sign in to book a session.</Text>
          <Text style={styles.authSubtitle}>
            We cannot wait for you to learn a new skill!
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
          <SafeAreaView style={styles.heroOverlay} edges={["top"]}>
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
            <Text style={styles.locationText}>
              {workshop.address || "Wichita, KS"}
            </Text>
          </View>

          {/* Description */}
          <Text
            style={styles.description}
            numberOfLines={showFullDescription ? undefined : 3}
          >
            {workshop.description}
          </Text>
          {(workshop.description?.length || 0) > 120 && (
            <Pressable
              onPress={() => setShowFullDescription(!showFullDescription)}
            >
              <Text style={styles.readMore}>
                {showFullDescription ? "Show less" : "Read more"}
              </Text>
            </Pressable>
          )}

          {/* Host info */}
          <View style={styles.hostRow}>
            <Image
              source={{
                uri:
                  workshop.host?.avatar_url || "https://via.placeholder.com/48",
              }}
              style={styles.hostAvatar}
            />
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>
                Hosted by {workshop.host?.full_name}
              </Text>
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
                        {showFullBio ? "See less" : "See more"}
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
              <Text style={styles.statValue}>
                ★ {workshop.avg_rating?.toFixed(1) || "—"}
              </Text>
              <Text style={styles.statLabel}>rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {workshop.total_reviews || 0}
              </Text>
              <Text style={styles.statLabel}>reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {workshop.equipment?.length || 0}
              </Text>
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
                      source={{
                        uri:
                          review.reviewer?.avatar_url ||
                          "https://via.placeholder.com/32",
                      }}
                      style={styles.reviewerAvatar}
                    />
                    <View>
                      <Text style={styles.reviewerName}>
                        {review.reviewer?.full_name}
                      </Text>
                      <Text style={styles.reviewRating}>
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </Text>
                    </View>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))}
            </>
          )}

          {/* Snapshot Timeline — past builds at this workshop */}
          {workshopProjects.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Build Logs</Text>
              <Text style={styles.buildLogSubtitle}>
                See what makers have built here
              </Text>
              {workshopProjects.map((project: Project) => (
                <View key={project.id} style={styles.projectBlock}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  {project.description && (
                    <Text style={styles.projectDesc}>
                      {project.description}
                    </Text>
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
                                style={styles.snapshotPhoto}
                              />
                            </View>
                            <View style={styles.photoContainer}>
                              <Text style={styles.photoLabel}>After</Text>
                              <Image
                                source={{ uri: snapshot.after_photo_url }}
                                style={styles.snapshotPhoto}
                              />
                            </View>
                          </View>

                          {snapshot.skills && snapshot.skills.length > 0 && (
                            <View style={styles.tagSection}>
                              <Text style={styles.tagSectionLabel}>
                                Skills gained
                              </Text>
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
            </>
          )}

          {/* Spacer for bottom CTA */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed bottom CTA — like "Send inquiry" in peek.png */}
      <SafeAreaView style={styles.ctaContainer} edges={["bottom"]}>
        <View style={styles.ctaContent}>
          <View>
            <Text style={styles.ctaPrice}>
              ${Number(workshop.hourly_rate).toFixed(0)}
            </Text>
            <Text style={styles.ctaPriceUnit}>per session</Text>
          </View>
          <Pressable style={styles.ctaButton} onPress={handleBookSession}>
            <Text style={styles.ctaButtonText}>Book a session</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
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
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroContainer: { position: "relative" },
  heroImage: { width, height: 300, backgroundColor: theme.surfaceSoft },
  heroOverlay: { position: "absolute", top: 0, left: 0, right: 0 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    marginTop: 8,
  },
  backIcon: {
    fontSize: 28,
    fontWeight: "300",
    color: theme.textPrimary,
    marginTop: -2,
  },
  indicators: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    alignSelf: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: { backgroundColor: theme.onPrimary, width: 20 },
  content: {
    padding: 20,
    marginTop: -20,
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  workshopName: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    color: theme.textPrimary,
    marginBottom: 8,
  },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  locationIcon: { fontSize: 14, marginRight: 4 },
  locationText: { fontSize: 15, lineHeight: 22, color: theme.textSecondary },
  description: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  readMore: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: theme.primary,
    marginBottom: 16,
  },
  hostRow: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: theme.surface,
    borderRadius: 16,
    marginBottom: 20,
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.surfaceSoft,
  },
  hostInfo: { marginLeft: 12, flex: 1 },
  hostName: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: theme.textPrimary,
  },
  hostBio: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.textSecondary,
    marginTop: 4,
  },
  bioToggle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: theme.primary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "700",
    color: theme.textPrimary,
    marginBottom: 12,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  tag: {
    backgroundColor: theme.surfaceSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    justifyContent: "space-around",
  },
  stat: { alignItems: "center" },
  statValue: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "700",
    color: theme.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textSecondary,
    marginTop: 2,
  },
  statDivider: { width: 1, backgroundColor: theme.border },
  reviewCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  reviewerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  reviewerName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: theme.textPrimary,
  },
  reviewRating: { fontSize: 13, lineHeight: 18, color: theme.warning },
  reviewComment: { fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
  // Snapshot timeline styles
  buildLogSubtitle: {
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
    marginBottom: 2,
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
  timelineNode: { flexDirection: "row", marginBottom: 16 } as any,
  timelineTrack: { width: 24, alignItems: "center" } as any,
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
  } as any,
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
  photoRow: { flexDirection: "row", gap: 8, marginBottom: 12 } as any,
  photoContainer: { flex: 1 },
  photoLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
    fontWeight: "500",
    marginBottom: 4,
  },
  snapshotPhoto: {
    width: "100%" as any,
    height: 100,
    borderRadius: 10,
    backgroundColor: theme.surfaceSoft,
  },
  tagSection: { marginTop: 8 },
  tagSectionLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
    fontWeight: "500",
    marginBottom: 6,
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
    shadowColor: theme.textPrimary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaPrice: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
    color: theme.primary,
  },
  ctaPriceUnit: { fontSize: 13, lineHeight: 18, color: theme.textSecondary },
  ctaButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  ctaButtonText: {
    color: theme.onPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },
  authPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  authTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
    color: theme.textPrimary,
  },
  authSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.textSecondary,
    marginTop: 8,
    textAlign: "center",
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
    lineHeight: 22,
    fontWeight: "700",
  },
});
