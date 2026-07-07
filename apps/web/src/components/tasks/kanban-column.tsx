"use client";

import { useDroppable } from "@dnd-kit/core";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import type { TaskStatus } from "@/graphql";
import type { BoardTask, HouseholdUser, TaskUpdateInput } from "@/components/tasks/task-table/types";
import { KanbanCard } from "@/components/tasks/kanban-card";
import type { KanbanColumn } from "@/lib/task-status";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
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
  onClearTasks?: () => void | Promise<void>;
  clearingTasks?: boolean;
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
  onClearTasks,
  clearingTasks = false,
}: KanbanColumnProps) {
  const [clearOpen, setClearOpen] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: column.status });

  if (collapsed) {
    return (
      <section
        ref={setNodeRef}
        className={cn(
          "flex w-12 shrink-0 flex-col items-center rounded-xl bg-background py-3",
          isOver && "bg-sage/60",
        )}
      >
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
    <section className="flex min-w-0 flex-1 flex-col rounded-xl bg-background">
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", column.dotClass)} />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {column.label}
          </h2>
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-muted">{tasks.length}</span>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="rounded p-0.5 text-text-muted hover:bg-surface"
            title={`Hide ${column.label}`}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          {onClearTasks && tasks.length > 0 ? (
            <button
              type="button"
              onClick={() => setClearOpen(true)}
              disabled={clearingTasks}
              className="rounded px-1 py-0.5 text-[0.65rem] font-medium text-text-muted hover:bg-surface hover:text-error disabled:opacity-50"
            >
              Clear
            </button>
          ) : null}
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

      {onClearTasks ? (
        <Modal
          open={clearOpen}
          onOpenChange={setClearOpen}
          title="Clear done tasks?"
          description={
            tasks.length === 1
              ? "This will permanently delete 1 completed task. This cannot be undone."
              : `This will permanently delete all ${tasks.length} completed tasks in this column. This cannot be undone.`
          }
        >
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={clearingTasks}
              onClick={() => {
                void Promise.resolve(onClearTasks()).then(() => setClearOpen(false));
              }}
            >
              {clearingTasks ? "Clearing…" : "Clear all"}
            </Button>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}
