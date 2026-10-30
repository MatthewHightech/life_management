import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { TaskProject } from "@/src/graphql";
import { theme } from "@/constants/theme";

type ProjectBarProps = {
  projects: TaskProject[];
  selectedId: string | null;
  loading?: boolean;
  creating?: boolean;
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<void>;
};

export function ProjectBar({
  projects,
  selectedId,
  loading,
  creating,
  onSelect,
  onCreate,
}: ProjectBarProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setName("");
    setError(null);
    setCreateOpen(true);
  }

  async function submitCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    setError(null);
    try {
      await onCreate(trimmed);
      setCreateOpen(false);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project.");
    }
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {loading && projects.length === 0 ? (
          <Text style={styles.loading}>Loading projects…</Text>
        ) : null}
        {projects.map((project) => {
          const selected = project.id === selectedId;
          return (
            <Pressable
              key={project.id}
              onPress={() => onSelect(project.id)}
              style={({ pressed }) => [
                styles.tab,
                selected && styles.tabSelected,
                pressed && styles.pressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]} numberOfLines={1}>
                {project.name}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={openCreate}
          disabled={creating || loading}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          accessibilityLabel="Add project"
        >
          {creating ? (
            <ActivityIndicator size="small" color={theme.textMuted} />
          ) : (
            <SymbolView
              name={{ ios: "plus", android: "add", web: "add" }}
              size={18}
              tintColor={theme.textMuted}
            />
          )}
        </Pressable>
      </ScrollView>

      <Modal
        visible={createOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCreateOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>New project</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Project name"
              placeholderTextColor={theme.textMuted}
              style={styles.modalInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => void submitCreate()}
            />
            {error ? <Text style={styles.modalError}>{error}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable onPress={() => setCreateOpen(false)} hitSlop={8}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => void submitCreate()}
                disabled={creating}
                hitSlop={8}
                style={creating && styles.disabled}
              >
                {creating ? (
                  <ActivityIndicator color={theme.primary} />
                ) : (
                  <Text style={styles.modalSave}>Create</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.borderSubtle,
    backgroundColor: theme.background,
  },
  row: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loading: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: theme.textMuted,
  },
  tab: {
    maxWidth: 180,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabSelected: {
    backgroundColor: "#e3f1f4",
  },
  tabLabel: {
    fontSize: 14,
    color: theme.textMuted,
  },
  tabLabelSelected: {
    color: theme.secondary,
    fontWeight: "600",
  },
  addButton: {
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.text,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.borderSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.background,
  },
  modalError: {
    color: theme.error,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 20,
    marginTop: 4,
  },
  modalCancel: {
    fontSize: 16,
    color: theme.textMuted,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
