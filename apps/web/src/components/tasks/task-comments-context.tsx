"use client";

import {
  CommentsProvider,
  useComments,
  type CommentsTarget,
} from "@/components/comments/comments-context";

export type TaskCommentsTarget = CommentsTarget;
export const TaskCommentsProvider = CommentsProvider;

export function useTaskComments() {
  const comments = useComments();
  return {
    activeTask: comments.activeTarget,
    openComments: comments.openComments,
    closeComments: comments.closeComments,
  };
}
