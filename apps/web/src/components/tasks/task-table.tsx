"use client";

import { useMemo } from "react";
import { partitionListTasks } from "@life/shared";
import { DoneTasksSection } from "@/components/tasks/task-table/done-tasks-section";
import { QuickAddTaskRow } from "@/components/tasks/task-table/quick-add-task-row";
import { TaskListTable } from "@/components/tasks/task-table/task-list-table";
import { TasksPageLayout } from "@/components/tasks/tasks-page-layout";
import { useBoardTasks, useTaskActions } from "@/components/tasks/use-board-tasks";
import { tasksBoardListQuery } from "@/lib/task-board-queries";

export function TaskTable() {
  const { boardTasks, currentUserId, waiting, error } = useBoardTasks(tasksBoardListQuery.variables);
  const { onUpdate } = useTaskActions();
  const { activeTasks, doneTasks } = useMemo(() => partitionListTasks(boardTasks), [boardTasks]);

  return (
    <TasksPageLayout waiting={waiting} error={error}>
      <div className="space-y-5">
        <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
          <QuickAddTaskRow currentUserId={currentUserId} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
          <TaskListTable
            tasks={activeTasks}
            emptyMessage="No active tasks yet."
            onUpdate={onUpdate}
          />
        </div>

        <DoneTasksSection tasks={doneTasks} onUpdate={onUpdate} />
      </div>
    </TasksPageLayout>
  );
}
