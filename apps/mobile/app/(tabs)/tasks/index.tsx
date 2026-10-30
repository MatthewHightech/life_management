import {
  groupTasksByStatus,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type TaskStatus,
} from "@life/shared";
import { SymbolView } from "expo-symbols";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProjectBar } from "@/src/components/tasks/project-bar";
import { TaskRow } from "@/src/components/tasks/task-row";
import { tasksOnProject, useTaskMutations, useTaskProjects, useTasksBoard } from "@/src/data";
import type { BoardTask } from "@/src/graphql";
import { theme } from "@/constants/theme";

export default function TasksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, loading, error, refresh } = useTasksBoard();
  const {
    projects,
    loading: projectsLoading,
    creating,
    createProject,
    refresh: refreshProjects,
  } = useTaskProjects();
  const { moveTask } = useTaskMutations();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [collapsed, setCollapsed] = useState<Partial<Record<TaskStatus, boolean>>>({
    BACKLOG: true,
    WAITING: true,
    DONE: true,
  });

  const resolvedProjectId = projects.some((project) => project.id === activeProjectId)
    ? activeProjectId
    : (projects[0]?.id ?? null);
  const fallbackProjectId = projects[0]?.id ?? null;

  useEffect(() => {
    if (resolvedProjectId && resolvedProjectId !== activeProjectId) {
      setActiveProjectId(resolvedProjectId);
    }
  }, [activeProjectId, resolvedProjectId]);

  const projectTasks = useMemo(
    () => tasksOnProject(tasks, resolvedProjectId, fallbackProjectId),
    [fallbackProjectId, resolvedProjectId, tasks],
  );
  const tasksByStatus = useMemo(() => groupTasksByStatus(projectTasks), [projectTasks]);

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
      await Promise.all([refresh(), refreshProjects()]);
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

  async function handleCreateProject(name: string) {
    const created = await createProject(name);
    if (created) {
      setActiveProjectId(created.id);
    }
  }

  function openNewTask() {
    if (!resolvedProjectId) {
      return;
    }
    router.push(`/task/new?projectId=${encodeURIComponent(resolvedProjectId)}`);
  }

  const listLoading = (loading || projectsLoading) && !pullRefreshing && tasks.length === 0;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.topChrome, { paddingTop: insets.top }]}>
        <ProjectBar
          projects={projects}
          selectedId={resolvedProjectId}
          loading={projectsLoading}
          creating={creating}
          onSelect={setActiveProjectId}
          onCreate={handleCreateProject}
        />
      </View>

      {listLoading ? (
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

      {!error && !listLoading ? (
        projectTasks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyBody}>Add a task to get the household moving.</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
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

      {resolvedProjectId ? (
        <Pressable
          accessibilityLabel="Add Task"
          onPress={openNewTask}
          style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
        >
          <SymbolView
            name={{ ios: "plus", android: "add", web: "add" }}
            size={28}
            tintColor={theme.onPrimary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  topChrome: {
    backgroundColor: theme.background,
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
  listContent: {
    paddingBottom: 88,
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
