import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/src/context/auth-context";
import { getAppVersion } from "@/src/lib/config";
import { theme } from "@/constants/theme";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        {user?.image ? (
          <Image source={{ uri: user.image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>{user?.name?.[0] ?? user?.email?.[0] ?? "?"}</Text>
          </View>
        )}
        <View style={styles.profileText}>
          <Text style={styles.name}>{user?.name ?? "Account"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Task due date reminders</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ true: theme.secondary }}
          />
        </View>
        <Text style={styles.hint}>Day-of reminders for tasks assigned to you.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <Text style={styles.version}>Version {getAppVersion()}</Text>
      </View>

      <Pressable
        style={[styles.signOutButton, signingOut && styles.signOutDisabled]}
        onPress={() => void handleSignOut()}
        disabled={signingOut}
      >
        {signingOut ? (
          <ActivityIndicator color={theme.error} />
        ) : (
          <Text style={styles.signOutText}>Sign out</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.borderSubtle,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    backgroundColor: theme.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.primary,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
  },
  email: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 4,
  },
  section: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.borderSubtle,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
  },
  hint: {
    marginTop: 8,
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 18,
  },
  version: {
    fontSize: 16,
    color: theme.text,
  },
  signOutButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.error,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutDisabled: {
    opacity: 0.7,
  },
  signOutText: {
    color: theme.error,
    fontSize: 16,
    fontWeight: "600",
  },
});
