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
  const { boardTasks, users, currentUserId, waiting, error } = useBoardTasks(tasksBoardListQuery.variables);
  const { onUpdate, onDelete } = useTaskActions();
  const { activeTasks, doneTasks } = useMemo(() => partitionListTasks(boardTasks), [boardTasks]);

  return (
    <TasksPageLayout waiting={waiting} error={error}>
      <div className="space-y-5">
        <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
          <QuickAddTaskRow users={users} currentUserId={currentUserId} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
          <TaskListTable
            tasks={activeTasks}
            users={users}
            emptyMessage="No active tasks yet."
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </div>

        <DoneTasksSection tasks={doneTasks} users={users} onDelete={onDelete} onUpdate={onUpdate} />
      </div>
    </TasksPageLayout>
  );
}
