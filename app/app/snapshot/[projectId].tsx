import { View, Text, StyleSheet, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useProjectDetail } from '@/hooks/useSnapshots';
import type { Snapshot } from '@/types';

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
                <Text style={styles.snapshotNumber}>Snapshot #{snapshot.sequence_number}</Text>
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

                {/* Tools used */}
                {snapshot.tools && snapshot.tools.length > 0 && (
                  <View style={styles.tagSection}>
                    <Text style={styles.tagLabel}>Tools used</Text>
                    <View style={styles.tagRow}>
                      {snapshot.tools.map((t) => (
                        <View key={t.id} style={styles.tag}>
                          <Text style={styles.tagText}>{t.equipment.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  projectTitle: { fontSize: 24, fontWeight: '700', color: '#000', marginBottom: 4 },
  projectDesc: { fontSize: 15, color: '#666', marginBottom: 8 },
  projectMeta: { fontSize: 13, color: '#aaa', marginBottom: 24 },
  timeline: { paddingLeft: 4 },
  timelineNode: { flexDirection: 'row', marginBottom: 20 },
  timelineTrack: { width: 24, alignItems: 'center' },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 1,
  },
  timelineDotFirst: { backgroundColor: '#000' },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: -2,
  },
  snapshotCard: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
  },
  snapshotNumber: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 4 },
  snapshotNotes: { fontSize: 13, color: '#666', marginBottom: 12 },
  photoRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  photoContainer: { flex: 1 },
  photoLabel: { fontSize: 11, color: '#999', fontWeight: '500', marginBottom: 4 },
  photo: { width: '100%', height: 100, borderRadius: 10, backgroundColor: '#e0e0e0' },
  tagSection: { marginTop: 8 },
  tagLabel: { fontSize: 12, color: '#999', fontWeight: '500', marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#e8e8e8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: { fontSize: 12, color: '#444', fontWeight: '500' },
  skillTag: { backgroundColor: '#E8F5E9' },
  skillTagText: { color: '#2E7D32' },
});
