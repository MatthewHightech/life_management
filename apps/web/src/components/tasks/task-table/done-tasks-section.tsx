"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { sectionCardClass } from "@/lib/section-header";
import { TaskListTable } from "@/components/tasks/task-table/task-list-table";
import type { BoardTask, HouseholdUser, TaskUpdateInput } from "@/components/tasks/task-table/types";

type DoneTasksSectionProps = {
  tasks: BoardTask[];
  users: HouseholdUser[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, input: TaskUpdateInput) => Promise<void>;
};

export function DoneTasksSection({ tasks, users, onDelete, onUpdate }: DoneTasksSectionProps) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className={sectionCardClass}>
      <button
        type="button"
        onClick={() => setCollapsed((current) => !current)}
        className="flex w-full items-center gap-2 border-b border-border-subtle bg-background px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-text-muted transition hover:bg-background/80"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        <span>Done</span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-text-muted">{tasks.length}</span>
      </button>

      {!collapsed && (
        <div className="overflow-x-auto">
          <TaskListTable
          tasks={tasks}
          users={users}
          emptyMessage="No completed tasks."
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
        </div>
      )}
    </div>
  );
}
