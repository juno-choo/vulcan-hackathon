import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '@/lib/store';
import { theme } from '@/constants/theme';

export default function LoginScreen() {
  const { signIn } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.back();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Vulcan</Text>
        <Text style={styles.subtitle}>Airbnb for Skilled Hands</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 42, lineHeight: 50, fontWeight: '800', textAlign: 'center', color: theme.primary },
  subtitle: { fontSize: 16, lineHeight: 24, color: theme.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 48 },
  form: { gap: 16 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: theme.surface,
    color: theme.textPrimary,
  },
  error: { color: theme.destructive, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  button: {
    height: 52,
    backgroundColor: theme.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: theme.onPrimary, fontSize: 16, fontWeight: '700', lineHeight: 22 },
});
