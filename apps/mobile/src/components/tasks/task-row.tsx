import {
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  formatShortDate,
  type TaskPriority,
  type TaskStatus,
} from "@life/shared";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AvatarStack } from "@/src/components/avatar";
import { Chip } from "@/src/components/chip";
import type { BoardTask } from "@/src/graphql";
import { theme } from "@/constants/theme";

type TaskRowProps = {
  task: BoardTask;
  onPress: () => void;
  onToggleComplete: () => void;
  busy?: boolean;
};

export function TaskRow({ task, onPress, onToggleComplete, busy }: TaskRowProps) {
  const done = task.status === "DONE";
  const priority = task.priority as TaskPriority;
  const status = task.status as TaskStatus;
  const priorityColors = TASK_PRIORITY_COLORS[priority] ?? TASK_PRIORITY_COLORS.MEDIUM;

  return (
    <Pressable
      style={[styles.row, task.isOverdue && styles.overdue]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Pressable
        style={styles.checkboxHit}
        onPress={onToggleComplete}
        disabled={busy}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        hitSlop={8}
      >
        <View style={[styles.checkbox, done && styles.checkboxChecked]}>
          {done ? (
            <SymbolView
              name={{ ios: "checkmark", android: "check", web: "check" }}
              size={14}
              tintColor={theme.onPrimary}
            />
          ) : null}
        </View>
      </Pressable>

      <View style={styles.body}>
        <Text style={[styles.title, done && styles.titleDone, task.isOverdue && styles.titleOverdue]} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={styles.meta}>
          <Chip label={TASK_STATUS_LABELS[status]} backgroundColor={TASK_STATUS_COLORS[status]} />
          <Chip
            label={TASK_PRIORITY_LABELS[priority]}
            backgroundColor={priorityColors.background}
            textColor={priorityColors.text}
          />
          <AvatarStack users={task.assignees} size={22} showEmpty={false} />
          {task.dueDate ? (
            <Text style={[styles.due, task.isOverdue && styles.titleOverdue]}>
              {formatShortDate(task.dueDate)}
            </Text>
          ) : null}
          {task.commentCount > 0 ? (
            <Text style={styles.comments}>
              {task.unreadCommentCount > 0 ? `${task.unreadCommentCount} new · ` : ""}
              {task.commentCount}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.borderSubtle,
  },
  overdue: {
    backgroundColor: theme.errorContainer,
  },
  checkboxHit: {
    paddingTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  body: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  titleDone: {
    color: theme.textMuted,
    textDecorationLine: "line-through",
  },
  titleOverdue: {
    color: theme.error,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  due: {
    fontSize: 12,
    color: theme.textMuted,
    fontWeight: "500",
  },
  comments: {
    fontSize: 12,
    color: theme.secondary,
    fontWeight: "600",
  },
});
