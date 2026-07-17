"use client";

import { CommentsButton } from "@/components/comments/comments-button";

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
  return (
    <CommentsButton
      targetId={taskId}
      targetTitle={taskTitle}
      commentCount={commentCount}
      unreadCommentCount={unreadCommentCount}
      className={className}
      placement={placement}
    />
  );
}
