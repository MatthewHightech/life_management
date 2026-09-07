import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/src/context/auth-context";
import { theme } from "@/constants/theme";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    try {
      await signIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.appName}>Life</Text>
        <Text style={styles.subtitle}>Household tasks, finances, meals, and more.</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={() => void handleSignIn()}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Continue with Google</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 24,
    justifyContent: "center",
  },
  hero: {
    marginBottom: 48,
  },
  appName: {
    fontSize: 48,
    fontWeight: "700",
    color: theme.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: theme.textMuted,
    lineHeight: 26,
  },
  error: {
    color: theme.error,
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});
