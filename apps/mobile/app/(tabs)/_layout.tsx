import { SymbolView } from "expo-symbols";
import { Link, Tabs } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="tasks"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTintColor: theme.primary,
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "checklist", android: "list", web: "list" }} tintColor={color} size={24} />
          ),
          headerRight: () => (
            <Link href="/settings" asChild>
              <Pressable style={styles.settingsButton} accessibilityLabel="Settings">
                {({ pressed }) => (
                  <SymbolView
                    name={{ ios: "gearshape", android: "settings", web: "settings" }}
                    size={22}
                    tintColor={theme.primary}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "dollarsign.circle", android: "attach_money", web: "attach_money" }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: "Meals",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "fork.knife", android: "restaurant", web: "restaurant" }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="receipts"
        options={{
          title: "Receipts",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "doc.text", android: "receipt", web: "receipt" }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="gear"
        options={{
          title: "Gear",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "backpack", android: "backpack", web: "backpack" }} tintColor={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.surface,
    borderTopColor: theme.borderSubtle,
  },
  header: {
    backgroundColor: theme.background,
  },
  headerTitle: {
    fontWeight: "600",
  },
  settingsButton: {
    marginRight: 16,
  },
});
