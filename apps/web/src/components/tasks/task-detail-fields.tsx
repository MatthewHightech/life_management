"use client";

import { EditableTextCell } from "@/components/editable-table";
import { DeleteTaskButton } from "@/components/tasks/delete-task-button";
import { EditableAssignees } from "@/components/tasks/task-table/editable-assignees";
import { EditableDueDate } from "@/components/tasks/task-table/editable-due-date";
import { EditableStatus } from "@/components/tasks/task-table/editable-pill-cells";
import type { BoardTask, HouseholdUser, TaskUpdateInput } from "@/components/tasks/task-table/types";

type TaskDetailFieldsProps = {
  task: BoardTask;
  users: HouseholdUser[];
  onUpdate: (input: TaskUpdateInput) => Promise<void>;
  onDelete: () => void;
};

export function TaskDetailFields({ task, users, onUpdate, onDelete }: TaskDetailFieldsProps) {
  return (
    <div className="space-y-4 border-b border-border-subtle px-4 py-4">
      <EditableTextCell
        value={task.title}
        onSave={(title) => onUpdate({ title })}
        className="text-lg font-semibold"
        inputClassName="text-lg font-semibold"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Status</p>
          <EditableStatus value={task.status} onSave={(status) => onUpdate({ status })} />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Due date</p>
          <EditableDueDate
            value={task.dueDate}
            overdue={task.isOverdue}
            onSave={(dueDate) => onUpdate({ dueDate })}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Assignees</p>
          <EditableAssignees
            assignees={task.assignees}
            users={users}
            onSave={(assigneeIds) => onUpdate({ assigneeIds })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <DeleteTaskButton taskTitle={task.title} onConfirm={onDelete} variant="labeled" />
      </div>
    </div>
  );
}
