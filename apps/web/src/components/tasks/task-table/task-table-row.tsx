import { cn } from "@/lib/cn";
import { DeleteTaskButton } from "@/components/tasks/delete-task-button";
import { TaskCommentsButton } from "@/components/tasks/task-comments-button";
import { EditableAssignees } from "./editable-assignees";
import { EditableDueDate } from "./editable-due-date";
import { EditablePriority, EditableStatus } from "./editable-pill-cells";
import { EditableText } from "./editable-text-cells";
import type { TaskTableRowProps } from "./types";

function TaskTableCell({
  className,
  contentClassName,
  children,
}: {
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <td className={cn("px-4 py-1.5 align-middle", className)}>
      <div className={cn("flex min-h-7 items-center", contentClassName)}>{children}</div>
    </td>
  );
}

export function TaskTableRow({ task, users, onDelete, onUpdate }: TaskTableRowProps) {
  const overdue = task.isOverdue;

  return (
    <tr className={cn("border-b border-border-subtle last:border-b-0", overdue && "bg-error-container/40")}>
      <TaskTableCell>
        <EditableText
          value={task.title}
          onSave={(title) => onUpdate({ title })}
          className={cn("font-medium", overdue && "text-error")}
          inputClassName="font-medium"
        />
      </TaskTableCell>
      <TaskTableCell className="whitespace-nowrap">
        <EditableStatus value={task.status} onSave={(status) => onUpdate({ status })} />
      </TaskTableCell>
      <TaskTableCell>
        <EditablePriority value={task.priority} onSave={(priority) => onUpdate({ priority })} />
      </TaskTableCell>
      <TaskTableCell>
        <EditableAssignees
          assignees={task.assignees}
          users={users}
          onSave={(assigneeIds) => onUpdate({ assigneeIds })}
        />
      </TaskTableCell>
      <TaskTableCell>
        <EditableDueDate value={task.dueDate} overdue={overdue} onSave={(dueDate) => onUpdate({ dueDate })} />
      </TaskTableCell>
      <TaskTableCell contentClassName="justify-end gap-1">
        <TaskCommentsButton
          taskId={task.id}
          taskTitle={task.title}
          commentCount={task.commentCount}
          unreadCommentCount={task.unreadCommentCount}
          placement="row"
        />
        <DeleteTaskButton
          taskTitle={task.title}
          onConfirm={onDelete}
          className="text-xs text-text-muted hover:text-error"
        />
      </TaskTableCell>
    </tr>
  );
}
