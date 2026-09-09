import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { TaskPriority, TaskStatus } from "@life/shared";
import { TextField } from "@/src/components/field";
import { TaskCommentsSection } from "@/src/components/tasks/task-comments";
import {
  AssigneePicker,
  DueDateField,
  PriorityPicker,
  StatusPicker,
} from "@/src/components/tasks/task-fields";
import { useTaskMutations, useTasksBoard } from "@/src/data";
import { theme } from "@/constants/theme";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, users, loading } = useTasksBoard();
  const { updateTask, deleteTask, deleting, updating } = useTaskMutations();

  const task = useMemo(() => tasks.find((item) => item.id === id), [tasks, id]);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!task) {
      return;
    }
    setTitle(task.title);
    setStatus(task.status as TaskStatus);
    setPriority(task.priority as TaskPriority);
    setAssigneeIds(task.assignees.map((user) => user.id));
    setDueDate(task.dueDate ?? null);
  }, [task]);

  async function save(patch?: {
    title?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeIds?: string[];
    dueDate?: string | null;
  }) {
    if (!task) {
      return;
    }
    setSaving(true);
    try {
      await updateTask(task.id, {
        title: patch?.title ?? title.trim(),
        status: patch?.status ?? status,
        priority: patch?.priority ?? priority,
        assigneeIds: patch?.assigneeIds ?? assigneeIds,
        dueDate: patch?.dueDate === undefined ? dueDate : patch.dueDate,
      });
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!task) {
      return;
    }
    Alert.alert("Delete task?", `"${task.title}" will be permanently removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void (async () => {
            await deleteTask(task.id);
            router.back();
          })();
        },
      },
    ]);
  }

  if (loading && !task) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text style={styles.missing}>Task not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit task",
          headerRight: () =>
            saving || updating ? <ActivityIndicator color={theme.primary} /> : null,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          onEndEditing={() => {
            if (title.trim() && title.trim() !== task.title) {
              void save({ title: title.trim() });
            }
          }}
          returnKeyType="done"
        />

        <StatusPicker
          value={status}
          onChange={(next) => {
            setStatus(next);
            void save({ status: next });
          }}
        />

        <PriorityPicker
          value={priority}
          onChange={(next) => {
            setPriority(next);
            void save({ priority: next });
          }}
        />

        <AssigneePicker
          users={users}
          selectedIds={assigneeIds}
          onChange={(next) => {
            setAssigneeIds(next);
            void save({ assigneeIds: next });
          }}
        />

        <DueDateField
          value={dueDate}
          onChange={(next) => {
            setDueDate(next);
            void save({ dueDate: next });
          }}
        />

        <TaskCommentsSection taskId={task.id} />

        <Pressable
          style={[styles.deleteButton, deleting && styles.deleteDisabled]}
          onPress={confirmDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color={theme.error} />
          ) : (
            <Text style={styles.deleteText}>Delete task</Text>
          )}
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 48,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.background,
  },
  missing: {
    color: theme.textMuted,
    fontSize: 16,
  },
  link: {
    color: theme.secondary,
    fontWeight: "600",
  },
  deleteButton: {
    marginTop: 8,
    alignItems: "center",
    paddingVertical: 14,
  },
  deleteDisabled: {
    opacity: 0.5,
  },
  deleteText: {
    color: theme.error,
    fontWeight: "600",
    fontSize: 16,
  },
});
