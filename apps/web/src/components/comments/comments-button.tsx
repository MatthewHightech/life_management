"use client";

import { MessageCircle } from "lucide-react";
import { useComments } from "@/components/comments/comments-context";
import { cn } from "@/lib/cn";

type CommentsButtonProps = {
  targetId: string;
  targetTitle: string;
  commentCount: number;
  unreadCommentCount: number;
  className?: string;
  placement?: "card" | "row";
};

export function CommentsButton({
  targetId,
  targetTitle,
  commentCount,
  unreadCommentCount,
  className,
  placement = "card",
}: CommentsButtonProps) {
  const { openComments, activeTarget } = useComments();
  const isActive = activeTarget?.id === targetId;
  const hasUnread = unreadCommentCount > 0;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        openComments({ id: targetId, title: targetTitle });
      }}
      className={cn(
        "inline-flex items-center gap-0.5 rounded text-text-muted transition hover:bg-background hover:text-text-main",
        placement === "card" ? "p-0.5" : "px-1.5 py-0.5 text-xs",
        isActive && "bg-background text-text-main",
        className,
      )}
      aria-label={
        commentCount > 0
          ? `Comments on ${targetTitle} (${commentCount}${hasUnread ? `, ${unreadCommentCount} unread` : ""})`
          : `Comments on ${targetTitle}`
      }
    >
      <MessageCircle className={cn(placement === "card" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      {commentCount > 0 ? (
        <span
          className={cn(
            "inline-flex items-center justify-center font-medium tabular-nums",
            placement === "card" ? "text-[0.65rem]" : "text-xs",
            hasUnread && "min-h-4 min-w-4 rounded-full bg-secondary/15 px-1 text-secondary",
          )}
        >
          {commentCount}
        </span>
      ) : null}
    </button>
  );
}
