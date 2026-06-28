"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useState } from "react";
import type { TasksBoardQuery, TasksBoardQueryVariables, UpdateTaskMutationVariables } from "@/graphql";
import { DELETE_TASK_MUTATION, TASKS_BOARD_QUERY, UPDATE_TASK_MUTATION } from "@/graphql";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { TaskTableRow } from "@/components/tasks/task-table/task-table-row";
import { TasksHeader } from "@/components/tasks/tasks-header";

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

  const tasks = data?.tasks ?? [];
  const users = data?.household?.users ?? [];

  return (
    <>
      <TasksHeader onNewTask={() => setCreateOpen(true)} />
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        {loading && <p className="text-sm text-text-muted">Loading tasks…</p>}
        {error && <p className="text-sm text-error">Could not load tasks: {error.message}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
            <table className="min-w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[13%]" />
                <col className="w-[8%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col />
                <col className="w-[72px]" />
              </colgroup>
              <thead className="border-b border-border-subtle bg-background text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Task name</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Assignees</th>
                  <th className="px-4 py-3 font-semibold">Due date</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-text-muted">
                      No tasks yet.
                    </td>
                  </tr>
                )}
                {tasks.map((task) => (
                  <TaskTableRow
                    key={task.id}
                    task={task}
                    users={users}
                    onDelete={() => deleteTask({ variables: { id: task.id } })}
                    onUpdate={(input) => handleUpdate(task.id, input)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateTaskModal open={createOpen} onOpenChange={setCreateOpen} users={users} />
    </>
  );
}
