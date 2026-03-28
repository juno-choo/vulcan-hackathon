import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '@/lib/store';
import { useUserProjects } from '@/hooks/useSnapshots';

export default function ProfileScreen() {
  const { user, signOut } = useStore();
  const router = useRouter();
  const { data: projects = [] } = useUserProjects(user?.id || '');

  const handleOpenProjects = () => {
    if (!projects.length) {
      Alert.alert('No projects yet', 'Book and complete a session to start seeing snapshots.');
      return;
    }

    router.push(`/snapshot/${projects[0].id}`);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.screenTitle}>Profile</Text>
        <View style={styles.authPrompt}>
          <Text style={styles.authTitle}>Sign in to your account</Text>
          <Text style={styles.authSubtitle}>Manage your profile, projects, and settings</Text>
          <Pressable style={styles.authButton} onPress={() => router.push('/login')}>
            <Text style={styles.authButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle}>Profile</Text>

      <View style={styles.profileCard}>
        <Image
          source={{ uri: user.avatar_url || 'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=200' }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <MenuItem label="Edit Profile" />
        <MenuItem label="My Projects" />
        <MenuItem label="Payment Methods" />
        <MenuItem label="Notifications" />
        <MenuItem label="Help & Support" />
      </View>

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function MenuItem({ label }: { label: string }) {
  return (
    <Pressable style={styles.menuItem}>
      <Text style={styles.menuItemText}>{label}</Text>
      <Text style={styles.menuItemArrow}>{'\u203A'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  screenTitle: { fontSize: 28, fontWeight: '700', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0f0f0' },
  profileInfo: { marginLeft: 16, flex: 1 },
  name: { fontSize: 20, fontWeight: '700', color: '#000' },
  email: { fontSize: 14, color: '#888', marginTop: 2 },
  section: { paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemText: { fontSize: 16, color: '#000' },
  menuItemArrow: { fontSize: 20, color: '#ccc' },
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  signOutText: { fontSize: 16, fontWeight: '600', color: '#FF3B30' },
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
