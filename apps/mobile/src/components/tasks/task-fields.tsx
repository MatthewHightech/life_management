import {
  TASK_PRIORITIES,
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  formatShortDate,
  startOfDay,
  toIsoString,
  toggleAssigneeId,
  type TaskPriority,
  type TaskStatus,
} from "@life/shared";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { ActionSheetIOS, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/src/components/avatar";
import { Chip } from "@/src/components/chip";
import { Field } from "@/src/components/field";
import type { HouseholdUser } from "@/src/graphql";
import { theme } from "@/constants/theme";

type StatusPickerProps = {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
};

export function StatusPicker({ value, onChange }: StatusPickerProps) {
  return (
    <Field label="Status">
      <View style={styles.wrap}>
        {TASK_STATUSES.map((status) => (
          <Chip
            key={status}
            label={TASK_STATUS_LABELS[status]}
            backgroundColor={TASK_STATUS_COLORS[status]}
            selected={value === status}
            onPress={() => onChange(status)}
          />
        ))}
      </View>
    </Field>
  );
}

type PriorityPickerProps = {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
};

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <Field label="Priority">
      <View style={styles.wrap}>
        {TASK_PRIORITIES.map((priority) => {
          const colors = TASK_PRIORITY_COLORS[priority];
          return (
            <Chip
              key={priority}
              label={TASK_PRIORITY_LABELS[priority]}
              backgroundColor={colors.background}
              textColor={colors.text}
              selected={value === priority}
              onPress={() => onChange(priority)}
            />
          );
        })}
      </View>
    </Field>
  );
}

type AssigneePickerProps = {
  users: HouseholdUser[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function AssigneePicker({ users, selectedIds, onChange }: AssigneePickerProps) {
  return (
    <Field label="Assignees">
      <View style={styles.assignees}>
        {users.map((user) => {
          const selected = selectedIds.includes(user.id);
          return (
            <Pressable
              key={user.id}
              onPress={() => onChange(toggleAssigneeId(selectedIds, user.id))}
              style={[styles.assignee, selected && styles.assigneeSelected]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
            >
              <Avatar user={user} size={36} selected={selected} />
              <Text style={styles.assigneeName} numberOfLines={1}>
                {user.name ?? user.email}
              </Text>
            </Pressable>
          );
        })}
        {users.length === 0 ? <Text style={styles.hint}>No household members loaded.</Text> : null}
      </View>
    </Field>
  );
}

type DueDateFieldProps = {
  value: string | null | undefined;
  onChange: (iso: string | null) => void;
};

export function DueDateField({ value, onChange }: DueDateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const selected = value ? new Date(value) : new Date();

  function openPicker() {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", value ? "Change date" : "Set date", ...(value ? ["Clear date"] : [])],
          cancelButtonIndex: 0,
          destructiveButtonIndex: value ? 2 : undefined,
        },
        (index) => {
          if (index === 1) {
            setShowPicker(true);
          }
          if (index === 2 && value) {
            onChange(null);
          }
        },
      );
      return;
    }
    setShowPicker(true);
  }

  return (
    <Field label="Due date">
      <Pressable style={styles.dateButton} onPress={openPicker}>
        <Text style={value ? styles.dateValue : styles.hint}>
          {value ? formatShortDate(value) : "No due date"}
        </Text>
      </Pressable>
      {showPicker ? (
        <DateTimePicker
          value={Number.isNaN(selected.getTime()) ? new Date() : selected}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            if (Platform.OS !== "ios") {
              setShowPicker(false);
            }
            if (date) {
              onChange(toIsoString(startOfDay(date)));
            }
          }}
        />
      ) : null}
      {showPicker && Platform.OS === "ios" ? (
        <Pressable style={styles.doneDate} onPress={() => setShowPicker(false)}>
          <Text style={styles.doneDateText}>Done</Text>
        </Pressable>
      ) : null}
    </Field>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  assignees: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  assignee: {
    width: 72,
    alignItems: "center",
    gap: 6,
    padding: 6,
    borderRadius: 12,
  },
  assigneeSelected: {
    backgroundColor: theme.sage,
  },
  assigneeName: {
    fontSize: 11,
    color: theme.text,
    textAlign: "center",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: theme.borderSubtle,
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateValue: {
    fontSize: 16,
    color: theme.text,
  },
  hint: {
    fontSize: 16,
    color: theme.textMuted,
  },
  doneDate: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneDateText: {
    color: theme.secondary,
    fontWeight: "600",
  },
});
