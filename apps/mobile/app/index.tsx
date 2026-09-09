import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@/src/context/auth-context";
import { theme } from "@/constants/theme";

/** Expo Router entry — `/` has no screen otherwise and lands on +not-found. */
export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return <Redirect href="/(tabs)/tasks" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
  },
});
