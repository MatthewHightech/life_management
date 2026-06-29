import { TaskTableRow } from "@/components/tasks/task-table/task-table-row";
import type { BoardTask, HouseholdUser, TaskUpdateInput } from "@/components/tasks/task-table/types";

type TaskListTableProps = {
  tasks: BoardTask[];
  users: HouseholdUser[];
  emptyMessage: string;
  onDelete: (id: string) => void;
  onUpdate: (id: string, input: TaskUpdateInput) => Promise<void>;
};

export function TaskListTable({ tasks, users, emptyMessage, onDelete, onUpdate }: TaskListTableProps) {
  return (
    <table className="min-w-full table-fixed text-left text-sm">
      <colgroup>
        <col className="w-[15%]" />
        <col className="w-[13%]" />
        <col className="w-[8%]" />
        <col className="w-[11%]" />
        <col className="w-[10%]" />
        <col />
        <col className="w-[7.5rem]" />
      </colgroup>
      <thead className="border-b border-border-subtle bg-background text-xs uppercase tracking-wide text-text-muted">
        <tr>
          <th className="px-4 py-2 font-semibold">Task name</th>
          <th className="px-4 py-2 font-semibold">Status</th>
          <th className="px-4 py-2 font-semibold">Priority</th>
          <th className="px-4 py-2 font-semibold">Assignees</th>
          <th className="px-4 py-2 font-semibold">Due date</th>
          <th className="px-4 py-2 font-semibold">Description</th>
          <th className="px-4 py-2 font-semibold" />
        </tr>
      </thead>
      <tbody>
        {tasks.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-6 text-center text-sm text-text-muted">
              {emptyMessage}
            </td>
          </tr>
        )}
        {tasks.map((task) => (
          <TaskTableRow
            key={task.id}
            task={task}
            users={users}
            onDelete={() => onDelete(task.id)}
            onUpdate={(input) => onUpdate(task.id, input)}
          />
        ))}
      </tbody>
    </table>
  );
}
