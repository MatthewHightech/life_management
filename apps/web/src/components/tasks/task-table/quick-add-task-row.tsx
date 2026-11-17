"use client";

import { useMutation } from "@apollo/client";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { TaskStatus } from "@/graphql";
import { CreateTaskDocument } from "@/graphql";
import { Button } from "@/components/ui/button";
import { inlineFieldInputClass } from "@/lib/inline-edit-styles";
import { cn } from "@/lib/cn";
import { useTaskBoards } from "@/components/tasks/task-boards-context";
import { tasksBoardRefetchQueries } from "@/lib/task-board-queries";
import { TASK_LIST_COLUMN_GRID } from "@/components/tasks/task-table/column-layout";
import { EditableAssignees } from "./editable-assignees";
import { EditableDueDate } from "./editable-due-date";
import { EditableStatus } from "./editable-pill-cells";
import type { HouseholdUser } from "./types";

const TASK_LIST_CELL = "flex min-h-7 w-full min-w-0 items-center px-4 py-1.5";

const DEFAULT_STATUS: TaskStatus = "BACKLOG";

type QuickAddTaskRowProps = {
  users: HouseholdUser[];
  currentUserId?: string;
};

export function QuickAddTaskRow({ users, currentUserId }: QuickAddTaskRowProps) {
  const { activeBoardId } = useTaskBoards();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>(DEFAULT_STATUS);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [titleError, setTitleError] = useState(false);

  const [createTask, { loading }] = useMutation(CreateTaskDocument, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  function resetForm() {
    setTitle("");
    setStatus(DEFAULT_STATUS);
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
          dueDate,
          assigneeIds: assigneeIds.length > 0 ? assigneeIds : undefined,
          isShared: true,
          projectId: activeBoardId ?? undefined,
        },
      },
    });

    resetForm();
  }

  return (
    <div className={TASK_LIST_COLUMN_GRID}>
      <div className={TASK_LIST_CELL}>
        <div className="w-full min-w-0 space-y-1">
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
        <EditableStatus value={status} onSave={async (next) => setStatus(next)} />
      </div>
      <div className={TASK_LIST_CELL}>
        <EditableAssignees
          assignees={users.filter((user) => assigneeIds.includes(user.id))}
          users={users}
          onSave={async (ids) => setAssigneeIds(ids)}
        />
      </div>
      <div className={TASK_LIST_CELL}>
        <EditableDueDate value={dueDate} overdue={false} onSave={async (next) => setDueDate(next)} />
      </div>
      <div className={cn(TASK_LIST_CELL, "justify-end")}>
        <Button
          type="button"
          disabled={loading}
          onClick={() => void handleAdd()}
          className="gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs"
        >
          {loading ? (
            "Adding…"
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add Task
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
