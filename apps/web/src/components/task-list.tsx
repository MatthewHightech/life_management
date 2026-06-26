"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  formatCalendarGroupLabel,
  formatShortDate,
  parseOptionalDate,
  toIsoString,
} from "@life/shared";
import { FormEvent, useState } from "react";
import {
  COMPLETE_TASK_MUTATION,
  CREATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
  TASKS_QUERY,
  type TasksQuery,
} from "@/graphql";

type TaskView = "TODAY" | "CALENDAR" | "KANBAN" | "BY_PERSON";

type TaskListItem = TasksQuery["tasks"][number];

type TaskListProps = {
  view: TaskView;
  groupBy?: "status" | "assignee" | "date";
};

const priorityLabels: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Med",
  HIGH: "High",
  URGENT: "Urgent",
};

export function TaskList({ view, groupBy }: TaskListProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { data, loading, error, refetch } = useQuery(TASKS_QUERY, {
    variables: { filter: { view, includeDone: view === "KANBAN" } },
  });

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK_MUTATION, {
    onCompleted: () => {
      setTitle("");
      setDueDate("");
      refetch();
    },
  });

  const [completeTask] = useMutation(COMPLETE_TASK_MUTATION, {
    onCompleted: () => refetch(),
  });

  const [deleteTask] = useMutation(DELETE_TASK_MUTATION, {
    onCompleted: () => refetch(),
  });

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    await createTask({
      variables: {
        input: {
          title: title.trim(),
          dueDate: dueDate ? toIsoString(parseOptionalDate(dueDate)) : null,
          isShared: true,
        },
      },
    });
  }

  const tasks = data?.tasks ?? [];

  const grouped = groupTasks(tasks, groupBy);

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Add task
          </button>
        </div>
      </form>

      {loading && <p className="text-sm text-muted">Loading tasks…</p>}
      {error && <p className="text-sm text-red-600">Could not load tasks: {error.message}</p>}

      {!loading && !error && tasks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-8 text-center">
          <p className="text-sm text-muted">No tasks yet. Add one above to get started.</p>
        </div>
      )}

      {Object.entries(grouped).map(([group, groupTasks]) => (
        <section key={group} className="space-y-2">
          {groupBy && <h3 className="text-sm font-medium text-muted">{group}</h3>}
          <ul className="space-y-2">
            {groupTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-card p-4 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={task.status === "DONE"}
                  onChange={(e) =>
                    completeTask({
                      variables: { id: task.id, completed: e.target.checked },
                    })
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`font-medium ${task.status === "DONE" ? "text-muted line-through" : ""}`}
                    >
                      {task.title}
                    </p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {priorityLabels[task.priority] ?? task.priority}
                    </span>
                    {task.isBlocked && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                        Blocked
                      </span>
                    )}
                    {!task.isShared && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-800">
                        Personal
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                    {task.dueDate && <span>Due {formatShortDate(task.dueDate)}</span>}
                    {task.assignee && (
                      <span>{task.assignee.name ?? task.assignee.email}</span>
                    )}
                    {task.project && <span>{task.project.name}</span>}
                    {task.subtasks.length > 0 && (
                      <span>
                        {task.subtasks.filter((s) => s.status === "DONE").length}/
                        {task.subtasks.length} subtasks
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTask({ variables: { id: task.id } })}
                  className="text-xs text-slate-400 hover:text-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function groupTasks(tasks: TaskListItem[], groupBy?: "status" | "assignee" | "date") {
  if (!groupBy) {
    return { Tasks: tasks };
  }

  if (groupBy === "status") {
    const order = ["TODO", "IN_PROGRESS", "DONE"];
    const groups: Record<string, typeof tasks> = {};
    for (const status of order) {
      const items = tasks.filter((t) => t.status === status);
      if (items.length > 0) {
        groups[status.replace("_", " ")] = items;
      }
    }
    return groups;
  }

  if (groupBy === "assignee") {
    const groups: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      const key = task.assignee?.name ?? task.assignee?.email ?? "Unassigned";
      groups[key] = groups[key] ?? [];
      groups[key].push(task);
    }
    return groups;
  }

  const groups: Record<string, typeof tasks> = {};
  for (const task of tasks) {
    const key = task.dueDate ? formatCalendarGroupLabel(task.dueDate) : "No due date";
    groups[key] = groups[key] ?? [];
    groups[key].push(task);
  }
  return groups;
}
