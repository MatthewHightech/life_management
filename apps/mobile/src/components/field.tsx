import { StyleSheet, Text, View, type TextInputProps, TextInput } from "react-native";
import { theme } from "@/constants/theme";

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

type TextFieldProps = TextInputProps & {
  label: string;
};

export function TextField({ label, style, multiline, ...props }: TextFieldProps) {
  return (
    <Field label={label}>
      <TextInput
        placeholderTextColor={theme.textMuted}
        style={[styles.input, multiline && styles.multiline, style]}
        multiline={multiline}
        {...props}
      />
    </Field>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.borderSubtle,
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
});
