import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

type ModulePlaceholderProps = {
  title: string;
  description: string;
};

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: theme.textMuted,
    lineHeight: 24,
  },
});
