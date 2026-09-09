import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!", headerShown: true, headerTintColor: theme.primary }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/(tabs)/tasks" style={styles.link} replace>
          <Text style={styles.linkText}>Go to Tasks</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: theme.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.text,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: theme.secondary,
    fontWeight: "600",
  },
});
