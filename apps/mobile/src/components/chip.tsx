import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";

type ChipProps = {
  label: string;
  backgroundColor: string;
  textColor?: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({
  label,
  backgroundColor,
  textColor = theme.onPrimary,
  selected,
  onPress,
}: ChipProps) {
  const content = (
    <View
      style={[
        styles.chip,
        { backgroundColor },
        selected === false && styles.unselected,
        selected && styles.selected,
      ]}
    >
      <Text style={[styles.label, { color: textColor }, selected === false && styles.unselectedLabel]}>
        {label}
      </Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  unselected: {
    opacity: 0.45,
  },
  unselectedLabel: {
    color: theme.text,
  },
  selected: {
    borderWidth: 1.5,
    borderColor: theme.primary,
  },
});
