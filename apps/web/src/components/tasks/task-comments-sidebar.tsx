"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback } from "react";
import { CommentsSidebar } from "@/components/comments/comments-sidebar";
import { useTaskComments, type TaskCommentsTarget } from "@/components/tasks/task-comments-context";
import {
  ADD_TASK_COMMENT_MUTATION,
  DELETE_TASK_COMMENT_MUTATION,
  MARK_TASK_COMMENTS_READ_MUTATION,
  TASK_COMMENTS_QUERY,
} from "@/graphql";
import type { TaskCommentsQuery, TaskCommentsQueryVariables } from "@/graphql";
import { tasksBoardRefetchQueries } from "@/lib/task-board-queries";

export function TaskCommentsSidebar() {
  const { activeTask, closeComments } = useTaskComments();
  const { data, loading, refetch } = useQuery<TaskCommentsQuery, TaskCommentsQueryVariables>(
    TASK_COMMENTS_QUERY,
    {
      skip: !activeTask,
      variables: { taskId: activeTask?.id ?? "" },
      fetchPolicy: "network-only",
    },
  );

  const refetchOptions = { refetchQueries: tasksBoardRefetchQueries, awaitRefetchQueries: true };

  const [markRead] = useMutation(MARK_TASK_COMMENTS_READ_MUTATION, refetchOptions);
  const [addComment, { loading: posting }] = useMutation(ADD_TASK_COMMENT_MUTATION, refetchOptions);
  const [deleteComment] = useMutation(DELETE_TASK_COMMENT_MUTATION, refetchOptions);

  const handleTargetVisible = useCallback(
    (target: TaskCommentsTarget) => {
      void markRead({ variables: { taskId: target.id } });
      void refetch({ taskId: target.id });
    },
    [markRead, refetch],
  );

  return (
    <CommentsSidebar
      target={activeTask}
      comments={data?.taskComments ?? []}
      loading={loading}
      posting={posting}
      onClose={closeComments}
      onTargetVisible={handleTargetVisible}
      onPost={async (target, body) => {
        await addComment({ variables: { taskId: target.id, body } });
        await refetch({ taskId: target.id });
      }}
      onDelete={async (id) => {
        await deleteComment({ variables: { id } });
        await refetch();
      }}
    />
  );
}
