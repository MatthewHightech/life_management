import { cn } from "@/lib/cn";
import { EditableAssignees } from "./editable-assignees";
import { EditableDueDate } from "./editable-due-date";
import { EditablePriority, EditableStatus } from "./editable-pill-cells";
import { EditableDescription, EditableText } from "./editable-text-cells";
import type { TaskTableRowProps } from "./types";

export function TaskTableRow({ task, users, onDelete, onUpdate }: TaskTableRowProps) {
  const overdue = task.isOverdue;

  return (
    <tr className={cn("border-b border-border-subtle last:border-b-0", overdue && "bg-error-container/40")}>
      <td className="px-4 py-3 align-top">
        <EditableText
          value={task.title}
          onSave={(title) => onUpdate({ title })}
          className={cn("font-medium", overdue && "text-error")}
          inputClassName="font-medium"
        />
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top">
        <EditableStatus value={task.status} overdue={overdue} onSave={(status) => onUpdate({ status })} />
      </td>
      <td className="px-4 py-3 align-top">
        <EditablePriority value={task.priority} onSave={(priority) => onUpdate({ priority })} />
      </td>
      <td className="px-4 py-3 align-top">
        <EditableAssignees
          assignees={task.assignees}
          users={users}
          onSave={(assigneeIds) => onUpdate({ assigneeIds })}
        />
      </td>
      <td className="px-4 py-3 align-top">
        <EditableDueDate value={task.dueDate} overdue={overdue} onSave={(dueDate) => onUpdate({ dueDate })} />
      </td>
      <td className="min-w-[280px] px-4 py-3 align-top">
        <EditableDescription value={task.description} onSave={(description) => onUpdate({ description })} />
      </td>
      <td className="px-4 py-3 align-top text-right">
        <button type="button" onClick={onDelete} className="text-xs text-text-muted hover:text-error">
          Delete
        </button>
      </td>
    </tr>
  );
}
