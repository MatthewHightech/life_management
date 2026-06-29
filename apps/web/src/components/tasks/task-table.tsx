"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo, useState } from "react";
import type { TasksBoardQuery, TasksBoardQueryVariables, UpdateTaskMutationVariables } from "@/graphql";
import { DELETE_TASK_MUTATION, TASKS_BOARD_QUERY, UPDATE_TASK_MUTATION } from "@/graphql";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { DoneTasksSection } from "@/components/tasks/task-table/done-tasks-section";
import { QuickAddTaskRow } from "@/components/tasks/task-table/quick-add-task-row";
import { TaskListTable } from "@/components/tasks/task-table/task-list-table";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { partitionListTasks } from "@/lib/task-list-sort";

const listQuery = {
  query: TASKS_BOARD_QUERY,
  variables: { filter: { view: "LIST" as const, includeDone: true } },
};

export function TaskTable() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data, loading, error } = useQuery<TasksBoardQuery, TasksBoardQueryVariables>(TASKS_BOARD_QUERY, {
    variables: listQuery.variables,
  });

  const [deleteTask] = useMutation(DELETE_TASK_MUTATION, {
    refetchQueries: [listQuery],
  });

  const [updateTask] = useMutation(UPDATE_TASK_MUTATION, {
    refetchQueries: [listQuery],
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

  const { activeTasks, doneTasks } = useMemo(
    () => partitionListTasks(data?.tasks ?? []),
    [data?.tasks],
  );

  const users = data?.household?.users ?? [];

  return (
    <>
      <TasksHeader onNewTask={() => setCreateOpen(true)} />
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        {loading && <p className="text-sm text-text-muted">Loading tasks…</p>}
        {error && <p className="text-sm text-error">Could not load tasks: {error.message}</p>}

        {!loading && !error && (
          <div className="space-y-5">
            <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
              <QuickAddTaskRow
                users={users}
                currentUserId={data?.me?.id}
                listQuery={listQuery}
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
      </div>

      <CreateTaskModal open={createOpen} onOpenChange={setCreateOpen} users={users} />
    </>
  );
}
