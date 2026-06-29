"use client";

import { useDroppable } from "@dnd-kit/core";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import type { TaskStatus } from "@/graphql";
import type { BoardTask, HouseholdUser, TaskUpdateInput } from "@/components/tasks/task-table/types";
import { KanbanCard } from "@/components/tasks/kanban-card";
import type { KanbanColumn } from "@/lib/task-status";
import { cn } from "@/lib/cn";

type KanbanColumnProps = {
  column: KanbanColumn;
  tasks: BoardTask[];
  users: HouseholdUser[];
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onAddTask: (status: TaskStatus) => void;
  onUpdateTask: (id: string, input: TaskUpdateInput) => Promise<void>;
  onDeleteTask: (id: string) => void;
};

export function KanbanColumnView({
  column,
  tasks,
  users,
  collapsed,
  onToggleCollapsed,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });

  if (column.collapsible && collapsed) {
    return (
      <section className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-background py-3">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="rounded p-1 text-text-muted hover:bg-surface"
          title={`Show ${column.label}`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="mt-4 [writing-mode:vertical-rl] rotate-180 text-xs font-semibold uppercase tracking-wide text-text-muted">
          {column.label} ({tasks.length})
        </span>
      </section>
    );
  }

  return (
    <section className="flex min-w-[260px] flex-1 flex-col rounded-xl bg-background">
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", column.dotClass)} />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {column.label}
          </h2>
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-muted">{tasks.length}</span>
          {column.collapsible && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="rounded p-0.5 text-text-muted hover:bg-surface"
              title={`Hide ${column.label}`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => onAddTask(column.status)}
          className="rounded p-1 text-text-muted hover:bg-surface"
          title={`Add to ${column.label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[420px] flex-1 flex-col gap-2 px-3 pb-2",
          isOver && "rounded-lg bg-sage/60",
        )}
      >
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            accentClass={column.accentClass}
            users={users}
            onUpdate={(input) => onUpdateTask(task.id, input)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
      </div>
    </section>
  );
}
