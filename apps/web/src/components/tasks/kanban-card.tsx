"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { formatShortDate } from "@life/shared";
import { GripVertical } from "lucide-react";
import { DeleteTaskButton } from "@/components/tasks/delete-task-button";
import { AssigneeAvatars } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { EditableAssignees } from "@/components/tasks/task-table/editable-assignees";
import { EditableDueDate } from "@/components/tasks/task-table/editable-due-date";
import { EditablePriority } from "@/components/tasks/task-table/editable-pill-cells";
import { EditableDescription, EditableText } from "@/components/tasks/task-table/editable-text-cells";
import type { BoardTask, HouseholdUser, TaskUpdateInput } from "@/components/tasks/task-table/types";
import { priorityChipClass, priorityLabels } from "@/lib/task-status";
import { truncateText } from "@/lib/truncate";
import { cn } from "@/lib/cn";

type KanbanCardProps = {
  task: BoardTask;
  accentClass: string;
  users?: HouseholdUser[];
  onUpdate?: (input: TaskUpdateInput) => Promise<void>;
  onDelete?: () => void;
  overlay?: boolean;
};

export function KanbanCard({
  task,
  accentClass,
  users = [],
  onUpdate,
  onDelete,
  overlay = false,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status },
    disabled: overlay,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const overdue = task.isOverdue;
  const editable = Boolean(onUpdate) && !overlay;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-border-subtle bg-surface p-3 shadow-sm",
        "border-t-4",
        accentClass,
        (isDragging || overlay) && "opacity-90",
        editable && "cursor-default",
      )}
    >
      <div className="flex items-start gap-2">
        {editable ? (
          <button
            type="button"
            {...listeners}
            {...attributes}
            className="mt-0.5 shrink-0 cursor-grab rounded p-0.5 text-text-muted transition hover:text-text-main active:cursor-grabbing"
            aria-label="Drag task"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : (
          <span className="mt-0.5 shrink-0 text-text-muted">
            <GripVertical className="h-4 w-4" />
          </span>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          {editable ? (
            <EditableText
              value={task.title}
              onSave={(title) => onUpdate!({ title })}
              className={cn("font-medium text-text-main", overdue && "text-error")}
              inputClassName="font-medium"
            />
          ) : (
            <p className={cn("text-sm font-medium text-text-main", overdue && "text-error")}>{task.title}</p>
          )}

          {editable ? (
            <EditableDescription
              value={task.description}
              onSave={(description) => onUpdate!({ description })}
              maxLength={80}
              className="text-xs"
            />
          ) : (
            <p className="text-xs text-text-muted">{truncateText(task.description, 80)}</p>
          )}

          {editable ? (
            <EditableDueDate
              value={task.dueDate}
              overdue={overdue}
              onSave={(dueDate) => onUpdate!({ dueDate })}
            />
          ) : (
            <p className={cn("text-xs", overdue ? "font-medium text-error" : "text-text-muted")}>
              {task.dueDate ? formatShortDate(task.dueDate) : "Set date"}
            </p>
          )}

          {task.subtaskProgress.total > 0 && (
            <div>
              <div className="mb-1 flex justify-between text-[10px] text-text-muted">
                <span>{task.subtaskProgress.percent}% complete</span>
                <span>
                  {task.subtaskProgress.completed}/{task.subtaskProgress.total}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-background">
                <div
                  className="h-1.5 rounded-full bg-primary-container"
                  style={{ width: `${task.subtaskProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            {editable ? (
              <EditableAssignees
                assignees={task.assignees}
                users={users}
                onSave={(assigneeIds) => onUpdate!({ assigneeIds })}
              />
            ) : (
              <AssigneeAvatars assignees={task.assignees} />
            )}

            {editable ? (
              <EditablePriority value={task.priority} onSave={(priority) => onUpdate!({ priority })} />
            ) : (
              <Chip className={priorityChipClass(task.priority)}>{priorityLabels[task.priority]}</Chip>
            )}
          </div>
        </div>

        {editable && onDelete && (
          <DeleteTaskButton
            taskTitle={task.title}
            onConfirm={onDelete}
            className="shrink-0 text-xs text-text-muted hover:text-error"
          />
        )}
      </div>
    </article>
  );
}
