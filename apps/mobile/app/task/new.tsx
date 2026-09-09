import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { TaskPriority, TaskStatus } from "@life/shared";
import { TextField } from "@/src/components/field";
import {
  AssigneePicker,
  DueDateField,
  PriorityPicker,
  StatusPicker,
} from "@/src/components/tasks/task-fields";
import { useTaskMutations, useTasksBoard } from "@/src/data";
import { theme } from "@/constants/theme";

const DEFAULT_STATUS: TaskStatus = "BACKLOG";
const DEFAULT_PRIORITY: TaskPriority = "LOW";

export default function NewTaskScreen() {
  const router = useRouter();
  const { users, me } = useTasksBoard();
  const { createTask, creating } = useTaskMutations();

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>(DEFAULT_STATUS);
  const [priority, setPriority] = useState<TaskPriority>(DEFAULT_PRIORITY);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [didSeedAssignee, setDidSeedAssignee] = useState(false);

  useEffect(() => {
    if (didSeedAssignee || !me?.id) {
      return;
    }
    setAssigneeIds([me.id]);
    setDidSeedAssignee(true);
  }, [didSeedAssignee, me?.id]);

  async function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required.");
      return;
    }

    setError(null);
    try {
      const result = await createTask({
        title: trimmed,
        status,
        priority,
        assigneeIds,
        dueDate,
      });
      const createdId = result.data?.createTask.id;
      router.back();
      if (createdId) {
        // Allow modal dismiss, then open detail.
        setTimeout(() => {
          router.push(`/(tabs)/tasks/${createdId}`);
        }, 50);
      }
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

        <StatusPicker value={status} onChange={setStatus} />
        <PriorityPicker value={priority} onChange={setPriority} />
        <AssigneePicker users={users} selectedIds={assigneeIds} onChange={setAssigneeIds} />
        <DueDateField value={dueDate} onChange={setDueDate} />

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
    paddingVertical: 14,
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
