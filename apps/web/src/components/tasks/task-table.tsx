"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";
import type { TasksBoardQuery, TasksBoardQueryVariables, UpdateTaskMutationVariables } from "@/graphql";
import { DELETE_TASK_MUTATION, TASKS_BOARD_QUERY, UPDATE_TASK_MUTATION } from "@/graphql";
import { DoneTasksSection } from "@/components/tasks/task-table/done-tasks-section";
import { QuickAddTaskRow } from "@/components/tasks/task-table/quick-add-task-row";
import { TaskListTable } from "@/components/tasks/task-table/task-list-table";
import { useTaskBoards } from "@/components/tasks/task-boards-context";
import { TasksPageLayout } from "@/components/tasks/tasks-page-layout";
import { tasksOnBoard } from "@/lib/task-boards";
import { partitionListTasks } from "@/lib/task-list-sort";
import { tasksBoardListQuery, tasksBoardRefetchQueries } from "@/lib/task-board-queries";

const listQuery = tasksBoardListQuery;

export function TaskTable() {
  const { boards, boardsLoading, activeBoardId } = useTaskBoards();
  const { data, loading, error } = useQuery<TasksBoardQuery, TasksBoardQueryVariables>(TASKS_BOARD_QUERY, {
    variables: listQuery.variables,
  });

  const [deleteTask] = useMutation(DELETE_TASK_MUTATION, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  const [updateTask] = useMutation(UPDATE_TASK_MUTATION, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  const handleUpdate = useCallback(
    async (id: string, input: UpdateTaskMutationVariables["input"]) => {
      await updateTask({ variables: { id, input } });
    },
    [updateTask],
  );

  const handleDelete = useCallback(
    (id: string) => {
      void deleteTask({ variables: { id } });
    },
    [deleteTask],
  );

  const { activeTasks, doneTasks } = useMemo(() => {
    const boardTasks = tasksOnBoard(data?.tasks ?? [], activeBoardId, boards[0]?.id ?? null);
    return partitionListTasks(boardTasks);
  }, [activeBoardId, boards, data?.tasks]);

  const waiting = loading || (boardsLoading && !activeBoardId);

  const users = data?.household?.users ?? [];

  return (
    <TasksPageLayout>
      {waiting && <p className="text-sm text-text-muted">Loading tasks…</p>}
      {error && <p className="text-sm text-error">Could not load tasks: {error.message}</p>}

      {!waiting && !error && (
        <div className="space-y-5">
          <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
            <QuickAddTaskRow
              users={users}
              currentUserId={data?.me?.id}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
            <TaskListTable
              tasks={activeTasks}
              users={users}
              emptyMessage="No active tasks yet."
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          </div>

          <DoneTasksSection
            tasks={doneTasks}
            users={users}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>
      )}
    </TasksPageLayout>
  );
}
