import {
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type TaskStatus,
} from "@life/shared";
import { SymbolView } from "expo-symbols";
import { Stack, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TaskRow } from "@/src/components/tasks/task-row";
import { useTaskMutations, useTasksBoard } from "@/src/data";
import type { BoardTask } from "@/src/graphql";
import { theme } from "@/constants/theme";

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, tasksByStatus, loading, error, refresh } = useTasksBoard();
  const { moveTask } = useTaskMutations();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [collapsed, setCollapsed] = useState<Partial<Record<TaskStatus, boolean>>>({
    BACKLOG: true,
    WAITING: true,
    DONE: true,
  });

  const sections = useMemo(
    () =>
      TASK_STATUSES.filter((status) => tasksByStatus[status].length > 0).map((status) => {
        const isCollapsed = collapsed[status] === true;
        const items = tasksByStatus[status];
        return {
          key: status,
          status,
          title: `${TASK_STATUS_LABELS[status]} (${items.length})`,
          data: isCollapsed ? ([] as BoardTask[]) : items,
        };
      }),
    [collapsed, tasksByStatus],
  );

  async function handlePullRefresh() {
    setPullRefreshing(true);
    try {
      await refresh();
    } finally {
      setPullRefreshing(false);
    }
  }

  async function toggleComplete(task: BoardTask) {
    setTogglingId(task.id);
    try {
      await moveTask(task.id, task.status === "DONE" ? "TODO" : "DONE");
    } finally {
      setTogglingId(null);
    }
  }

  function toggleSection(status: TaskStatus) {
    setCollapsed((current) => ({
      ...current,
      [status]: !(current[status] === true),
    }));
  }

  return (
    <>
      <Stack.Screen
        options={{
          // iOS 26 wraps headerRight in a Liquid Glass chrome; hide it so only our button shows.
          unstable_headerRightItems: () => [
            {
              type: "custom",
              hidesSharedBackground: true,
              element: (
                <Pressable
                  accessibilityLabel="Add Task"
                  onPress={() => router.push("/task/new")}
                  style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                >
                  <SymbolView
                    name={{ ios: "plus", android: "add", web: "add" }}
                    size={16}
                    tintColor={theme.onPrimary}
                  />
                  <Text style={styles.addLabel}>Add Task</Text>
                </Pressable>
              ),
            },
          ],
        }}
      />

      {loading && !pullRefreshing && tasks.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : null}

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>Could not load tasks.</Text>
          <Text style={styles.errorDetail}>{error.message}</Text>
          <Pressable onPress={() => void refresh()}>
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      ) : null}

      {!error ? (
        tasks.length === 0 && !loading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyBody}>Add a task to get the household moving.</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={pullRefreshing}
                onRefresh={() => void handlePullRefresh()}
                tintColor={theme.primary}
              />
            }
            renderSectionHeader={({ section }) => {
              const isCollapsed = collapsed[section.status] === true;
              return (
                <Pressable style={styles.sectionHeader} onPress={() => toggleSection(section.status)}>
                  <View style={styles.sectionTitleRow}>
                    <View style={[styles.statusDot, { backgroundColor: TASK_STATUS_COLORS[section.status] }]} />
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                  </View>
                  <Text style={styles.sectionToggle}>{isCollapsed ? "Show" : "Hide"}</Text>
                </Pressable>
              );
            }}
            renderItem={({ item }) => (
              <TaskRow
                task={item}
                busy={togglingId === item.id}
                onPress={() => router.push(`/(tabs)/tasks/${item.id}`)}
                onToggleComplete={() => void toggleComplete(item)}
              />
            )}
            stickySectionHeadersEnabled={false}
          />
        )
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  addLabel: {
    color: theme.onPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  error: {
    color: theme.error,
    fontWeight: "600",
    fontSize: 16,
  },
  errorDetail: {
    color: theme.textMuted,
    textAlign: "center",
  },
  retry: {
    marginTop: 8,
    color: theme.secondary,
    fontWeight: "600",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 8,
    backgroundColor: theme.background,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
  },
  emptyBody: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surfaceContainerLow,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.borderSubtle,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text,
  },
  sectionToggle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.secondary,
  },
});
