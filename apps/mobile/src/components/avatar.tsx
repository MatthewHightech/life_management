import { Image, StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

type AvatarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type AvatarProps = {
  user: AvatarUser;
  size?: number;
  selected?: boolean;
};

export function Avatar({ user, size = 28, selected }: AvatarProps) {
  const initial = (user.name?.[0] ?? user.email?.[0] ?? "?").toUpperCase();

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: selected ? theme.primary : theme.borderSubtle,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      {user.image ? (
        <Image source={{ uri: user.image }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
        </View>
      )}
    </View>
  );
}

type AvatarStackProps = {
  users: AvatarUser[];
  size?: number;
  max?: number;
  showEmpty?: boolean;
};

export function AvatarStack({ users, size = 28, max = 3, showEmpty = true }: AvatarStackProps) {
  if (users.length === 0) {
    return showEmpty ? <Text style={styles.empty}>Unassigned</Text> : null;
  }

  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;

  return (
    <View style={styles.stack}>
      {visible.map((user, index) => (
        <View key={`${user.email ?? user.name ?? index}`} style={{ marginLeft: index === 0 ? 0 : -8 }}>
          <Avatar user={user} size={size} />
        </View>
      ))}
      {overflow > 0 ? <Text style={styles.overflow}>+{overflow}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    backgroundColor: theme.surfaceContainer,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.sage,
  },
  initial: {
    fontWeight: "600",
    color: theme.primary,
  },
  stack: {
    flexDirection: "row",
    alignItems: "center",
  },
  empty: {
    fontSize: 12,
    color: theme.textMuted,
  },
  overflow: {
    marginLeft: 6,
    fontSize: 12,
    color: theme.textMuted,
  },
});
