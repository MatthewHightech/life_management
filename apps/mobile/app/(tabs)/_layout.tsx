import { SymbolView } from "expo-symbols";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { StyleSheet } from "react-native";
import { theme } from "@/constants/theme";

type TabConfig = {
  name: string;
  title: string;
  icon: ComponentProps<typeof SymbolView>["name"];
  headerShown?: boolean;
};

const TABS: TabConfig[] = [
  { name: "tasks", title: "Tasks", headerShown: false, icon: { ios: "checklist", android: "list", web: "list" } },
  { name: "finance", title: "Finance", icon: { ios: "dollarsign.circle", android: "attach_money", web: "attach_money" } },
  { name: "meals", title: "Meals", icon: { ios: "fork.knife", android: "restaurant", web: "restaurant" } },
  { name: "receipts", title: "Receipts", icon: { ios: "doc.text", android: "receipt", web: "receipt" } },
  { name: "gear", title: "Gear", icon: { ios: "backpack", android: "backpack", web: "backpack" } },
  { name: "settings", title: "Settings", icon: { ios: "gearshape", android: "settings", web: "settings" } },
];

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
      {TABS.map(({ name, title, icon, headerShown }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            headerShown,
            tabBarIcon: ({ color }) => <SymbolView name={icon} tintColor={color} size={24} />,
          }}
        />
      ))}
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
});
