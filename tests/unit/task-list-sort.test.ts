import { describe, expect, it } from "vitest";
import { compareActiveListTasks, partitionListTasks } from "../../apps/web/src/lib/task-list-sort";

type BoardTask = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "WAITING" | "DONE";
  priority: string;
  isShared: boolean;
  isBlocked: boolean;
  isOverdue: boolean;
  dueDate?: string | null;
  completedAt?: string | null;
  subtaskProgress: { completed: number; total: number; percent: number };
  assignees: [];
};

function task(overrides: Partial<BoardTask>): BoardTask {
  return {
    id: "1",
    title: "Task",
    status: "TODO",
    priority: "MEDIUM",
    isShared: true,
    isBlocked: false,
    isOverdue: false,
    subtaskProgress: { completed: 0, total: 0, percent: 0 },
    assignees: [],
    ...overrides,
  } as BoardTask;
}

describe("task list sort", () => {
  it("orders active tasks by overdue then status", () => {
    const tasks = [
      task({ id: "todo", title: "Todo", status: "TODO" }),
      task({ id: "waiting", title: "Waiting", status: "WAITING" }),
      task({ id: "progress", title: "Progress", status: "IN_PROGRESS" }),
      task({ id: "overdue", title: "Overdue", status: "TODO", isOverdue: true, dueDate: "2025-01-01" }),
    ];

    const { activeTasks, doneTasks } = partitionListTasks([
      ...tasks,
      task({ id: "done", title: "Done", status: "DONE" }),
    ]);

    expect(activeTasks.map((item) => item.id)).toEqual(["overdue", "waiting", "progress", "todo"]);
    expect(doneTasks.map((item) => item.id)).toEqual(["done"]);
  });

  it("sorts overdue tasks by due date", () => {
    const earlier = task({ id: "a", title: "A", status: "TODO", isOverdue: true, dueDate: "2025-01-01" });
    const later = task({ id: "b", title: "B", status: "IN_PROGRESS", isOverdue: true, dueDate: "2025-02-01" });

    expect(compareActiveListTasks(earlier, later)).toBeLessThan(0);
  });
});
