import { cn } from "@/lib/cn";
import { CommentsButton } from "@/components/comments/comments-button";
import { EditableTextCell } from "@/components/editable-table";
import { DeleteTaskButton } from "@/components/tasks/delete-task-button";
import { EditableAssignees } from "./editable-assignees";
import { EditableDueDate } from "./editable-due-date";
import { EditableStatus } from "./editable-pill-cells";
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
    <td className={cn("max-w-0 overflow-hidden px-4 py-1.5 align-middle", className)}>
      <div className={cn("flex min-h-7 w-full min-w-0 items-center", contentClassName)}>{children}</div>
    </td>
  );
}

export function TaskTableRow({ task, users, onDelete, onUpdate }: TaskTableRowProps) {
  const overdue = task.isOverdue;

  return (
    <tr className={cn("border-b border-border-subtle last:border-b-0", overdue && "bg-error-container/40")}>
      <TaskTableCell>
        <EditableTextCell
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
        <CommentsButton
          targetId={task.id}
          targetTitle={task.title}
          commentCount={task.commentCount}
          unreadCommentCount={task.unreadCommentCount}
          placement="row"
        />
        <DeleteTaskButton taskTitle={task.title} onConfirm={onDelete} />
      </TaskTableCell>
    </tr>
  );
}
