import { Stack } from "expo-router";
import { theme } from "@/constants/theme";

export default function TasksLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.primary,
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Tasks" }} />
      <Stack.Screen name="[id]" options={{ title: "Task" }} />
    </Stack>
  );
}
