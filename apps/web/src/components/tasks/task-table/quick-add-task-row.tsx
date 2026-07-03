"use client";

import { useMutation } from "@apollo/client";
import { formatShortDate, parseOptionalDate, startOfDay, toIsoString } from "@life/shared";
import { useEffect, useMemo, useState } from "react";
import type { TaskPriority, TaskStatus } from "@/graphql";
import { CREATE_TASK_MUTATION } from "@/graphql";
import { AssigneeAvatars, SelectableMemberAvatar } from "@/components/ui/avatar";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { Button } from "@/components/ui/button";
import { FloatingPanel } from "@/components/ui/floating-panel";
import { PillSelect } from "@/components/ui/pill-select";
import { usePopoverAnchor } from "@/hooks/use-popover-anchor";
import { inlineFieldInputClass } from "@/lib/inline-edit-styles";
import { priorityChipClass, priorityLabels } from "@/lib/task-status";
import {
  prioritySelectOptions,
  statusSelectOptions,
  statusTriggerDisplay,
  toggleAssigneeId,
} from "@/lib/task-pills";
import { cn } from "@/lib/cn";
import { tasksBoardRefetchQueries } from "@/lib/task-board-queries";
import type { HouseholdUser } from "./types";

const TASK_LIST_COLUMN_GRID =
  "grid w-full min-w-full grid-cols-[18%_14%_10%_14%_12%_minmax(9rem,1fr)] text-left text-sm";
const TASK_LIST_CELL = "flex min-h-7 items-center px-4 py-1.5";

const DEFAULT_STATUS: TaskStatus = "TODO";
const DEFAULT_PRIORITY: TaskPriority = "LOW";

type QuickAddTaskRowProps = {
  users: HouseholdUser[];
  currentUserId?: string;
};

function toDueDateIso(date: Date): string | null {
  return toIsoString(startOfDay(date));
}

function DraftAssigneePicker({
  assigneeIds,
  users,
  onChange,
}: {
  assigneeIds: string[];
  users: HouseholdUser[];
  onChange: (ids: string[]) => void;
}) {
  const { open, anchorRef, toggle, close, triggerClassName } = usePopoverAnchor();
  const assignees = users.filter((user) => assigneeIds.includes(user.id));

  if (users.length === 0) {
    return <AssigneeAvatars assignees={assignees} />;
  }

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={toggle}
        className={triggerClassName("inline-flex min-h-7 items-center rounded-md px-1 py-0.5")}
      >
        <AssigneeAvatars assignees={assignees} />
      </button>

      <FloatingPanel open={open} anchorRef={anchorRef} onClose={close} minWidth={200} className="p-3">
        <div className="flex flex-wrap justify-center gap-3">
          {users.map((user) => (
            <SelectableMemberAvatar
              key={user.id}
              name={user.name}
              email={user.email}
              image={user.image}
              selected={assigneeIds.includes(user.id)}
              onClick={() => onChange(toggleAssigneeId(assigneeIds, user.id))}
            />
          ))}
        </div>
      </FloatingPanel>
    </>
  );
}

function DraftDueDatePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const { open, anchorRef, toggle, close, triggerClassName } = usePopoverAnchor();
  const selectedDate = value ? parseOptionalDate(value) : null;

  function persist(nextIso: string | null) {
    close();
    onChange(nextIso);
  }

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={toggle}
        className={triggerClassName("inline-flex min-h-7 items-center rounded-md px-2 py-0.5 text-sm text-text-muted")}
      >
        {value ? formatShortDate(value) : "Set date"}
      </button>

      <FloatingPanel open={open} anchorRef={anchorRef} onClose={close} minWidth={256} className="p-0">
        <CalendarPicker
          value={selectedDate}
          onSelect={(date) => persist(toDueDateIso(date))}
          onClear={() => persist(null)}
        />
      </FloatingPanel>
    </>
  );
}

export function QuickAddTaskRow({ users, currentUserId }: QuickAddTaskRowProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>(DEFAULT_STATUS);
  const [priority, setPriority] = useState<TaskPriority>(DEFAULT_PRIORITY);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [titleError, setTitleError] = useState(false);

  const [createTask, { loading }] = useMutation(CREATE_TASK_MUTATION, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  const statusDisplay = useMemo(() => statusTriggerDisplay(status), [status]);

  function resetForm() {
    setTitle("");
    setStatus(DEFAULT_STATUS);
    setPriority(DEFAULT_PRIORITY);
    setAssigneeIds(currentUserId ? [currentUserId] : []);
    setDueDate(null);
    setTitleError(false);
  }

  useEffect(() => {
    if (currentUserId) {
      setAssigneeIds([currentUserId]);
    }
  }, [currentUserId]);

  async function handleAdd() {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    await createTask({
      variables: {
        input: {
          title: title.trim(),
          status,
          priority,
          dueDate,
          assigneeIds: assigneeIds.length > 0 ? assigneeIds : undefined,
          isShared: true,
        },
      },
    });

    resetForm();
  }

  return (
    <div className={TASK_LIST_COLUMN_GRID}>
      <div className={cn(TASK_LIST_CELL)}>
        <div className="space-y-1">
          <input
            value={title}
            placeholder="Task name"
            disabled={loading}
            onChange={(event) => {
              setTitle(event.target.value);
              if (titleError && event.target.value.trim()) {
                setTitleError(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleAdd();
              }
            }}
            className={cn(inlineFieldInputClass, "font-medium", titleError && "border-error focus:border-error")}
          />
          {titleError && <p className="text-xs text-error">Task name is required.</p>}
        </div>
      </div>
      <div className={cn(TASK_LIST_CELL, "whitespace-nowrap")}>
        <PillSelect
          value={status}
          triggerLabel={statusDisplay.label}
          triggerChipClassName={statusDisplay.chipClassName}
          options={statusSelectOptions()}
          onSelect={async (next) => setStatus(next)}
        />
      </div>
      <div className={TASK_LIST_CELL}>
        <PillSelect
          value={priority}
          triggerLabel={priorityLabels[priority]}
          triggerChipClassName={priorityChipClass(priority)}
          options={prioritySelectOptions()}
          onSelect={async (next) => setPriority(next)}
        />
      </div>
      <div className={TASK_LIST_CELL}>
        <DraftAssigneePicker assigneeIds={assigneeIds} users={users} onChange={setAssigneeIds} />
      </div>
      <div className={TASK_LIST_CELL}>
        <DraftDueDatePicker value={dueDate} onChange={setDueDate} />
      </div>
      <div className={cn(TASK_LIST_CELL, "justify-end")}>
        <Button
          type="button"
          disabled={loading}
          onClick={() => void handleAdd()}
          className="whitespace-nowrap px-3 py-1.5 text-xs"
        >
          {loading ? "Adding…" : "Add Task"}
        </Button>
      </div>
    </div>
  );
}
