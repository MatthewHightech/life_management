"use client";

import { Check } from "lucide-react";
import { useComments } from "@/components/comments/comments-context";
import { cn } from "@/lib/cn";
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

export function TaskTableRow({ task, onUpdate }: TaskTableRowProps) {
  const { openComments, activeTarget } = useComments();
  const done = task.status === "DONE";
  const overdue = task.isOverdue && !done;
  const isActive = activeTarget?.id === task.id;

  return (
    <tr
      className={cn(
        "cursor-pointer border-b border-border-subtle last:border-b-0 hover:bg-background/70",
        overdue && "bg-error-container/40 hover:bg-error-container/55",
        isActive && "bg-background",
      )}
      onClick={() => openComments({ id: task.id, title: task.title })}
    >
      <TaskTableCell className="w-10 px-3" contentClassName="justify-center">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void onUpdate({ status: done ? "TODO" : "DONE" });
          }}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
            done
              ? "border-status-done bg-status-done text-on-primary"
              : "border-border-subtle bg-surface text-transparent hover:border-status-done",
          )}
          aria-label={done ? `Mark ${task.title} as todo` : `Mark ${task.title} done`}
        >
          <Check className="h-3 w-3" />
        </button>
      </TaskTableCell>
      <TaskTableCell>
        <span
          className={cn(
            "truncate font-medium text-text-main",
            done && "text-text-muted line-through",
            overdue && "text-error",
          )}
        >
          {task.title}
        </span>
      </TaskTableCell>
    </tr>
  );
}
