import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { TaskStatus } from "@life/shared";
import { TextField } from "@/src/components/field";
import { TaskCommentsSection } from "@/src/components/tasks/task-comments";
import {
  ProjectPicker,
  TaskFields,
  type TaskFieldValues,
} from "@/src/components/tasks/task-fields";
import { useTaskMutations, useTaskProjects, useTasksBoard } from "@/src/data";
import { theme } from "@/constants/theme";

type TaskDraft = TaskFieldValues & {
  title: string;
  projectId: string | null;
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { tasks, users, loading } = useTasksBoard();
  const { projects } = useTaskProjects();
  const { updateTask, deleteTask, deleting, updating } = useTaskMutations();

  const task = useMemo(() => tasks.find((item) => item.id === id), [tasks, id]);

  const [draft, setDraft] = useState<TaskDraft>({
    title: "",
    status: "TODO",
    assigneeIds: [],
    dueDate: null,
    projectId: null,
  });
  const [saving, setSaving] = useState(false);
  const [composerFocused, setComposerFocused] = useState(false);

  useEffect(() => {
    if (!task) {
      return;
    }
    setDraft({
      title: task.title,
      status: task.status as TaskStatus,
      assigneeIds: task.assignees.map((user) => user.id),
      dueDate: task.dueDate ?? null,
      projectId: task.project?.id ?? projects[0]?.id ?? null,
    });
  }, [projects, task]);

  useEffect(() => {
    if (!composerFocused) {
      return;
    }
    const scrollComposerIntoView = () =>
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    scrollComposerIntoView();
    const subscription = Keyboard.addListener("keyboardDidShow", scrollComposerIntoView);
    return () => subscription.remove();
  }, [composerFocused]);

  async function save(patch: Partial<TaskDraft>) {
    if (!task) {
      return;
    }
    setSaving(true);
    try {
      await updateTask(task.id, { ...draft, title: draft.title.trim(), ...patch });
    } finally {
      setSaving(false);
    }
  }

  function change(patch: Partial<TaskDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    void save(patch);
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
        onPress: async () => {
          await deleteTask(task.id);
          router.back();
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            composerFocused && styles.contentComposerFocused,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <TextField
            label="Title"
            value={draft.title}
            onChangeText={(title) => setDraft((current) => ({ ...current, title }))}
            onEndEditing={() => {
              const title = draft.title.trim();
              if (title && title !== task.title) {
                void save({ title });
              }
            }}
            returnKeyType="done"
          />

          <TaskFields values={draft} users={users} onChange={change} />

          <ProjectPicker
            projects={projects}
            value={draft.projectId}
            onChange={(projectId) => change({ projectId })}
          />

          <TaskCommentsSection
            taskId={task.id}
            onComposerFocus={() => setComposerFocused(true)}
            onComposerBlur={() => setComposerFocused(false)}
          />

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
      </KeyboardAvoidingView>
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
  contentComposerFocused: {
    paddingBottom: 44,
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
