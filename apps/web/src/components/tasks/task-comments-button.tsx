"use client";

import { MessageCircle } from "lucide-react";
import { useTaskComments } from "@/components/tasks/task-comments-context";
import { cn } from "@/lib/cn";

type TaskCommentsButtonProps = {
  taskId: string;
  taskTitle: string;
  commentCount: number;
  unreadCommentCount: number;
  className?: string;
  placement?: "card" | "row";
};

export function TaskCommentsButton({
  taskId,
  taskTitle,
  commentCount,
  unreadCommentCount,
  className,
  placement = "card",
}: TaskCommentsButtonProps) {
  const { openComments, activeTask } = useTaskComments();
  const isActive = activeTask?.id === taskId;
  const hasUnread = unreadCommentCount > 0;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        openComments({ id: taskId, title: taskTitle });
      }}
      className={cn(
        "relative inline-flex items-center gap-0.5 rounded text-text-muted transition hover:bg-background hover:text-text-main",
        placement === "card" ? "p-0.5" : "px-1.5 py-0.5 text-xs",
        isActive && "bg-background text-text-main",
        className,
      )}
      aria-label={
        commentCount > 0
          ? `Comments on ${taskTitle} (${commentCount}${hasUnread ? `, ${unreadCommentCount} unread` : ""})`
          : `Comments on ${taskTitle}`
      }
    >
      <MessageCircle className={cn(placement === "card" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      {commentCount > 0 ? (
        <span className={cn("font-medium tabular-nums", placement === "card" ? "text-[0.65rem]" : "text-xs")}>
          {commentCount}
        </span>
      ) : null}
      {hasUnread ? (
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-secondary ring-2 ring-surface" />
      ) : null}
    </button>
  );
}
