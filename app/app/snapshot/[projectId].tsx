import { View, Text, StyleSheet, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useProjectDetail } from '@/hooks/useSnapshots';
import { theme } from '@/constants/theme';
import type { Snapshot } from '@/types';

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
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

export default function SnapshotTimelineScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { data: project, isLoading } = useProjectDetail(projectId);

  if (isLoading || !project) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Build Log</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Project info */}
        <Text style={styles.projectTitle}>{project.title}</Text>
        {project.description && (
          <Text style={styles.projectDesc}>{project.description}</Text>
        )}
        <Text style={styles.projectMeta}>
          {project.booking?.workshop?.name} · {project.snapshots?.length || 0} snapshots
        </Text>

        {/* Vertical git-commit-style timeline */}
        <View style={styles.timeline}>
          {project.snapshots?.map((snapshot, index) => (
            <Animated.View
              key={snapshot.id}
              entering={FadeInDown.delay(index * 100).duration(400)}
              style={styles.timelineNode}
            >
              {/* Timeline line + dot */}
              <View style={styles.timelineTrack}>
                <View style={[
                  styles.timelineDot,
                  index === 0 && styles.timelineDotFirst,
                ]} />
                {index < (project.snapshots?.length || 0) - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              {/* Snapshot card */}
              <View style={styles.snapshotCard}>
                <View style={styles.snapshotHeader}>
                  <Text style={styles.snapshotNumber}>Snapshot #{snapshot.sequence_number}</Text>
                  <Text style={styles.snapshotTime}>{timeAgo(snapshot.created_at)}</Text>
                </View>
                {snapshot.notes && (
                  <Text style={styles.snapshotNotes}>{snapshot.notes}</Text>
                )}

                {/* Before/After photos */}
                <View style={styles.photoRow}>
                  <View style={styles.photoContainer}>
                    <Text style={styles.photoLabel}>Before</Text>
                    <Image source={{ uri: snapshot.before_photo_url }} style={styles.photo} />
                  </View>
                  <View style={styles.photoContainer}>
                    <Text style={styles.photoLabel}>After</Text>
                    <Image source={{ uri: snapshot.after_photo_url }} style={styles.photo} />
                  </View>
                </View>

                {/* Skills gained */}
                {snapshot.skills && snapshot.skills.length > 0 && (
                  <View style={styles.tagSection}>
                    <Text style={styles.tagLabel}>Skills gained</Text>
                    <View style={styles.tagRow}>
                      {snapshot.skills.map((s) => (
                        <View key={s.id} style={[styles.tag, styles.skillTag]}>
                          <Text style={[styles.tagText, styles.skillTagText]}>{s.skill.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backText: { fontSize: 18, color: theme.textPrimary },
  headerTitle: { fontSize: 18, lineHeight: 25, fontWeight: '600', color: theme.textPrimary },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  projectTitle: { fontSize: 24, lineHeight: 32, fontWeight: '700', color: theme.textPrimary, marginBottom: 4 },
  projectDesc: { fontSize: 15, lineHeight: 22, color: theme.textSecondary, marginBottom: 8 },
  projectMeta: { fontSize: 13, lineHeight: 18, color: theme.textMuted, marginBottom: 24 },
  timeline: { paddingLeft: 4 },
  timelineNode: { flexDirection: 'row', marginBottom: 20 },
  timelineTrack: { width: 24, alignItems: 'center' },
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
  snapshotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } as any,
  snapshotNumber: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: theme.textPrimary },
  snapshotTime: { fontSize: 13, lineHeight: 18, fontWeight: '400', color: theme.textMuted },
  snapshotNotes: { fontSize: 13, lineHeight: 18, color: theme.textSecondary, marginBottom: 12 },
  photoRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  photoContainer: { flex: 1 },
  photoLabel: { fontSize: 13, lineHeight: 18, color: theme.textMuted, fontWeight: '500', marginBottom: 4 },
  photo: { width: '100%', height: 100, borderRadius: 10, backgroundColor: theme.surfaceSoft },
  tagSection: { marginTop: 8 },
  tagLabel: { fontSize: 13, lineHeight: 18, color: theme.textMuted, fontWeight: '500', marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: theme.surfaceSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: { fontSize: 13, lineHeight: 18, color: theme.textSecondary, fontWeight: '500' },
  skillTag: { backgroundColor: '#D8EEE7' },
  skillTagText: { color: theme.success },
});
