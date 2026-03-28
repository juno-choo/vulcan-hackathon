import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '@/lib/store';

export default function ProfileScreen() {
  const { user, signOut } = useStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle}>Profile</Text>

      <View style={styles.profileCard}>
        <Image
          source={{ uri: user?.avatar_url || 'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=200' }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.full_name || 'Guest User'}</Text>
          <Text style={styles.email}>{user?.email || 'Not signed in'}</Text>
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
      <Text style={styles.menuItemArrow}>›</Text>
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
});
