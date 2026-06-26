"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { TasksBoardQuery } from "@/graphql";
import { AssigneeAvatars } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { priorityChipClass, priorityLabels } from "@/lib/task-status";
import { cn } from "@/lib/cn";

type BoardTask = TasksBoardQuery["tasks"][number];

type KanbanCardProps = {
  task: BoardTask;
  accentClass: string;
};

export function KanbanCard({ task, accentClass }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab rounded-lg border border-border-subtle bg-surface p-3 shadow-sm active:cursor-grabbing",
        "border-t-4",
        accentClass,
        isDragging && "opacity-40",
      )}
    >
      <p className="text-sm font-medium text-text-main">{task.title}</p>

      {task.subtaskProgress.total > 0 && (
        <div className="mt-3">
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

      <div className="mt-3 flex items-center justify-between gap-2">
        <AssigneeAvatars assignees={task.assignees} />
        <Chip className={priorityChipClass(task.priority)}>{priorityLabels[task.priority]}</Chip>
      </div>
    </article>
  );
}
