import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TextField } from "@/src/components/field";
import { TaskFields, type TaskFieldValues } from "@/src/components/tasks/task-fields";
import { useTaskMutations, useTasksBoard } from "@/src/data";
import { theme } from "@/constants/theme";

export default function NewTaskScreen() {
  const router = useRouter();
  const { projectId: projectIdParam } = useLocalSearchParams<{ projectId?: string }>();
  const projectId = typeof projectIdParam === "string" ? projectIdParam : projectIdParam?.[0];
  const { users, me } = useTasksBoard();
  const { createTask, creating } = useTaskMutations();

  const [title, setTitle] = useState("");
  const [fields, setFields] = useState<TaskFieldValues>({
    status: "BACKLOG",
    assigneeIds: [],
    dueDate: null,
  });
  const [error, setError] = useState<string | null>(null);
  const didSeedAssignee = useRef(false);

  useEffect(() => {
    const meId = me?.id;
    if (didSeedAssignee.current || !meId) {
      return;
    }
    didSeedAssignee.current = true;
    setFields((current) => ({ ...current, assigneeIds: [meId] }));
  }, [me?.id]);

  async function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required.");
      return;
    }

    setError(null);
    try {
      await createTask({
        title: trimmed,
        ...fields,
        projectId: projectId || undefined,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task.");
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>New task</Text>
        <Pressable
          onPress={() => void handleCreate()}
          disabled={creating}
          hitSlop={8}
          style={creating && styles.disabled}
        >
          {creating ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <Text style={styles.save}>Add</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="What needs doing?"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => void handleCreate()}
        />

        <TaskFields
          values={fields}
          users={users}
          onChange={(patch) => setFields((current) => ({ ...current, ...patch }))}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.borderSubtle,
    backgroundColor: theme.surface,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.text,
  },
  cancel: {
    fontSize: 16,
    color: theme.textMuted,
    minWidth: 64,
  },
  save: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.primary,
    minWidth: 64,
    textAlign: "right",
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  error: {
    color: theme.error,
    fontSize: 14,
  },
});
