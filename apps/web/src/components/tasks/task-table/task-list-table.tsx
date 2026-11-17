import { TaskTableRow } from "@/components/tasks/task-table/task-table-row";
import { TASK_LIST_TABLE_COLUMNS } from "@/components/tasks/task-table/column-layout";
import type { BoardTask, TaskUpdateInput } from "@/components/tasks/task-table/types";

type TaskListTableProps = {
  tasks: BoardTask[];
  emptyMessage: string;
  onUpdate: (id: string, input: TaskUpdateInput) => Promise<void>;
};

export function TaskListTable({ tasks, emptyMessage, onUpdate }: TaskListTableProps) {
  return (
    <table className="min-w-full table-fixed text-left text-sm">
      <colgroup>
        {TASK_LIST_TABLE_COLUMNS.map((column) => (
          <col key={column.id} className={column.className} />
        ))}
      </colgroup>
      <thead className="border-b border-border-subtle bg-background text-xs uppercase tracking-wide text-text-muted">
        <tr>
          <th className="px-3 py-2 font-semibold" />
          <th className="px-4 py-2 font-semibold">Task</th>
        </tr>
      </thead>
      <tbody>
        {tasks.length === 0 && (
          <tr>
            <td colSpan={2} className="px-4 py-6 text-center text-sm text-text-muted">
              {emptyMessage}
            </td>
          </tr>
        )}
        {tasks.map((task) => (
          <TaskTableRow key={task.id} task={task} onUpdate={(input) => onUpdate(task.id, input)} />
        ))}
      </tbody>
    </table>
  );
}
