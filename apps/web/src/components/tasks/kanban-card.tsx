"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { formatShortDate } from "@life/shared";
import { GripVertical } from "lucide-react";
import { DeleteTaskButton } from "@/components/tasks/delete-task-button";
import { TaskCommentsButton } from "@/components/tasks/task-comments-button";
import { AssigneeAvatars } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { EditableAssignees } from "@/components/tasks/task-table/editable-assignees";
import { EditableDueDate } from "@/components/tasks/task-table/editable-due-date";
import { EditablePriority } from "@/components/tasks/task-table/editable-pill-cells";
import { EditableText } from "@/components/tasks/task-table/editable-text-cells";
import type { BoardTask, HouseholdUser, TaskUpdateInput } from "@/components/tasks/task-table/types";
import { priorityChipClass, priorityLabels } from "@/lib/task-status";
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

  const style = isDragging ? undefined : { transform: CSS.Translate.toString(transform) };

  const overdue = task.isOverdue;
  const editable = Boolean(onUpdate) && !overlay;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-lg border border-border-subtle bg-surface p-2 shadow-sm",
        "border-t-4",
        accentClass,
        isDragging && "opacity-0",
        overlay && "cursor-grabbing shadow-lg",
        editable && "cursor-default",
      )}
    >
      {editable && onDelete ? (
        <div className="absolute right-1 top-1">
          <DeleteTaskButton
            taskTitle={task.title}
            onConfirm={onDelete}
            variant="icon"
            className="rounded p-0.5 text-text-muted hover:text-error"
          />
        </div>
      ) : null}

      <div className="flex items-start gap-1.5 pr-5">
        {editable ? (
          <button
            type="button"
            {...listeners}
            {...attributes}
            className="shrink-0 cursor-grab rounded p-0.5 text-text-muted transition hover:text-text-main active:cursor-grabbing"
            aria-label="Drag task"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="shrink-0 text-text-muted">
            <GripVertical className="h-3.5 w-3.5" />
          </span>
        )}

        <div className="min-w-0 flex-1 space-y-1">
          {editable ? (
            <EditableText
              value={task.title}
              onSave={(title) => onUpdate!({ title })}
              wrap
              className={cn("text-sm font-medium text-text-main", overdue && "text-error")}
              inputClassName="font-medium"
            />
          ) : (
            <p
              className={cn(
                "text-sm font-medium leading-snug break-words text-text-main",
                overdue && "text-error",
              )}
            >
              {task.title}
            </p>
          )}

          {task.subtaskProgress.total > 0 ? (
            <div>
              <div className="mb-0.5 flex justify-between text-[10px] leading-none text-text-muted">
                <span>{task.subtaskProgress.percent}% complete</span>
                <span>
                  {task.subtaskProgress.completed}/{task.subtaskProgress.total}
                </span>
              </div>
              <div className="h-1 rounded-full bg-background">
                <div
                  className="h-1 rounded-full bg-primary-container"
                  style={{ width: `${task.subtaskProgress.percent}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-1.5">
            <div className="min-w-0">
              {editable ? (
                <EditableAssignees
                  assignees={task.assignees}
                  users={users}
                  onSave={(assigneeIds) => onUpdate!({ assigneeIds })}
                  avatarClassName="h-6 w-6 text-[9px] ring-1"
                  triggerClassName="px-0"
                />
              ) : (
                <AssigneeAvatars assignees={task.assignees} avatarClassName="h-6 w-6 text-[9px] ring-1" />
              )}
            </div>

            <div className="min-w-0">
              {editable ? (
                <EditableDueDate
                  value={task.dueDate}
                  overdue={overdue}
                  onSave={(dueDate) => onUpdate!({ dueDate })}
                  className="w-full min-w-0 truncate px-1 text-xs"
                />
              ) : task.dueDate ? (
                <p
                  className={cn(
                    "truncate text-xs leading-none",
                    overdue ? "font-medium text-error" : "text-text-muted",
                  )}
                >
                  {formatShortDate(task.dueDate)}
                </p>
              ) : null}
            </div>

            <div className="justify-self-end">
              {editable ? (
                <EditablePriority
                  value={task.priority}
                  onSave={(priority) => onUpdate!({ priority })}
                  triggerClassName="px-0"
                  chipClassName="normal-case tracking-normal"
                />
              ) : (
                <Chip className={cn("whitespace-nowrap normal-case tracking-normal", priorityChipClass(task.priority))}>
                  {priorityLabels[task.priority]}
                </Chip>
              )}
            </div>

            {editable ? (
              <div className="justify-self-end">
                <TaskCommentsButton
                  taskId={task.id}
                  taskTitle={task.title}
                  commentCount={task.commentCount}
                  unreadCommentCount={task.unreadCommentCount}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
