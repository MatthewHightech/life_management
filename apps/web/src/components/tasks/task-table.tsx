"use client";

import { useMutation, useQuery } from "@apollo/client";
import { formatShortDate } from "@life/shared";
import { useState } from "react";
import type { TasksBoardQuery, TasksBoardQueryVariables } from "@/graphql";
import { DELETE_TASK_MUTATION, TASKS_BOARD_QUERY } from "@/graphql";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { AssigneeAvatars } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { priorityChipClass, priorityLabels, statusChipClass } from "@/lib/task-status";
import { cn } from "@/lib/cn";

type BoardTask = TasksBoardQuery["tasks"][number];

function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function TaskTable() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data, loading, error } = useQuery<TasksBoardQuery, TasksBoardQueryVariables>(TASKS_BOARD_QUERY, {
    variables: { filter: { view: "LIST", includeDone: true } },
  });

  const [deleteTask] = useMutation(DELETE_TASK_MUTATION, {
    refetchQueries: [{ query: TASKS_BOARD_QUERY, variables: { filter: { view: "LIST", includeDone: true } } }],
  });

  const tasks = data?.tasks ?? [];

  return (
    <>
      <TasksHeader onNewTask={() => setCreateOpen(true)} />
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        {loading && <p className="text-sm text-text-muted">Loading tasks…</p>}
        {error && <p className="text-sm text-error">Could not load tasks: {error.message}</p>}

        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border-subtle bg-background text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Task name</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Assignees</th>
                  <th className="px-4 py-3 font-semibold">Due date</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-text-muted">
                      No tasks yet.
                    </td>
                  </tr>
                )}
                {tasks.map((task: BoardTask) => (
                  <TaskRow key={task.id} task={task} onDelete={() => deleteTask({ variables: { id: task.id } })} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateTaskModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        users={data?.household?.users ?? []}
      />
    </>
  );
}

function TaskRow({ task, onDelete }: { task: BoardTask; onDelete: () => void }) {
  const overdue = task.isOverdue;

  return (
    <tr className={cn("border-b border-border-subtle last:border-b-0", overdue && "bg-error-container/40")}>
      <td className="px-4 py-4">
        <p className={cn("font-medium", overdue && "text-error")}>{task.title}</p>
      </td>
      <td className="px-4 py-4">
        <Chip className={statusChipClass(overdue ? "OVERDUE" : task.status)}>
          {overdue ? "Overdue" : statusLabel(task.status)}
        </Chip>
      </td>
      <td className="px-4 py-4">
        <Chip className={priorityChipClass(task.priority)}>{priorityLabels[task.priority]}</Chip>
      </td>
      <td className="px-4 py-4">
        <AssigneeAvatars assignees={task.assignees} />
      </td>
      <td className={cn("px-4 py-4 text-text-muted", overdue && "font-medium text-error")}>
        {task.dueDate ? formatShortDate(task.dueDate) : "—"}
      </td>
      <td className="px-4 py-4 text-right">
        <button type="button" onClick={onDelete} className="text-xs text-text-muted hover:text-error">
          Delete
        </button>
      </td>
    </tr>
  );
}
