import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "@/src/context/auth-context";
import { theme } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from "expo-router";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === "sign-in";

    if (!user && !inAuthGroup) {
      router.replace("/sign-in");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)/tasks");
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="task/new"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
        </Stack>
      </AuthGate>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
  },
});
