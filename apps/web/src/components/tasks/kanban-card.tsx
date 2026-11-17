"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { formatDueDate } from "@life/shared";
import { GripVertical, MessageCircle } from "lucide-react";
import { useComments } from "@/components/comments/comments-context";
import { EditableTextCell } from "@/components/editable-table";
import { AssigneeAvatars } from "@/components/ui/avatar";
import { EditableAssignees } from "@/components/tasks/task-table/editable-assignees";
import { EditableDueDate } from "@/components/tasks/task-table/editable-due-date";
import type { BoardTask, HouseholdUser, TaskUpdateInput } from "@/components/tasks/task-table/types";
import { cn } from "@/lib/cn";

type KanbanCardProps = {
  task: BoardTask;
  accentClass: string;
  users?: HouseholdUser[];
  onUpdate?: (input: TaskUpdateInput) => Promise<void>;
  overlay?: boolean;
  autoEditTitle?: boolean;
  onAutoEditTitleApplied?: () => void;
};

export function KanbanCard({
  task,
  accentClass,
  users = [],
  onUpdate,
  overlay = false,
  autoEditTitle = false,
  onAutoEditTitleApplied,
}: KanbanCardProps) {
  const { openComments, activeTarget } = useComments();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { type: "task", status: task.status },
    disabled: overlay,
  });

  const style = isDragging ? undefined : { transform: CSS.Translate.toString(transform) };

  const overdue = task.isOverdue;
  const editable = Boolean(onUpdate) && !overlay;
  const isActive = activeTarget?.id === task.id;
  const hasUnread = task.unreadCommentCount > 0;

  return (
    <article
      ref={setNodeRef}
      style={style}
      onClick={() => {
        if (editable) {
          openComments({ id: task.id, title: task.title });
        }
      }}
      className={cn(
        "relative rounded-lg border border-border-subtle bg-surface p-2 shadow-sm",
        "border-t-4",
        accentClass,
        isDragging && "opacity-0",
        overlay && "cursor-grabbing shadow-lg",
        editable && "cursor-pointer",
        isActive && "bg-background",
      )}
    >
      <div className="flex items-start gap-1.5">
        {editable ? (
          <button
            type="button"
            {...listeners}
            {...attributes}
            onClick={(event) => event.stopPropagation()}
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
            <div onClick={(event) => event.stopPropagation()}>
              <EditableTextCell
                value={task.title}
                onSave={(title) => onUpdate!({ title })}
                wrap
                startInEditMode={autoEditTitle}
                onStartInEditModeApplied={onAutoEditTitleApplied}
                className={cn("text-sm font-medium text-text-main", overdue && "text-error")}
                inputClassName="font-medium"
              />
            </div>
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

          <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
            <div className="shrink-0" onClick={(event) => event.stopPropagation()}>
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

            <div className="min-w-0 max-w-full" onClick={(event) => event.stopPropagation()}>
              {editable ? (
                <EditableDueDate
                  value={task.dueDate}
                  overdue={overdue}
                  onSave={(dueDate) => onUpdate!({ dueDate })}
                  className="max-w-full truncate px-0.5 text-xs"
                />
              ) : task.dueDate ? (
                <p
                  className={cn(
                    "truncate text-xs leading-none",
                    overdue ? "font-medium text-error" : "text-text-muted",
                  )}
                >
                  {formatDueDate(task.dueDate)}
                </p>
              ) : null}
            </div>

            {task.commentCount > 0 ? (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-0.5 p-0.5 text-text-muted",
                  hasUnread && "text-secondary",
                )}
                aria-label={
                  hasUnread
                    ? `${task.commentCount} comments, ${task.unreadCommentCount} unread`
                    : `${task.commentCount} comments`
                }
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span
                  className={cn(
                    "inline-flex items-center justify-center text-[0.65rem] font-medium tabular-nums",
                    hasUnread && "min-h-4 min-w-4 rounded-full bg-secondary/15 px-1",
                  )}
                >
                  {task.commentCount}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
