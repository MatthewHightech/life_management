"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback } from "react";
import { useComments, type CommentsTarget } from "@/components/comments/comments-context";
import { CommentsSidebar } from "@/components/comments/comments-sidebar";
import {
  AddTaskCommentDocument,
  DeleteTaskCommentDocument,
  MarkTaskCommentsReadDocument,
  TaskCommentsDocument,
} from "@/graphql";
import type { TaskCommentsQuery, TaskCommentsQueryVariables } from "@/graphql";
import { tasksBoardRefetchQueries } from "@/lib/task-board-queries";

export function TaskCommentsSidebar() {
  const { activeTarget: activeTask, closeComments } = useComments();
  const { data, loading, refetch } = useQuery<TaskCommentsQuery, TaskCommentsQueryVariables>(
    TaskCommentsDocument,
    {
      skip: !activeTask,
      variables: { taskId: activeTask?.id ?? "" },
      fetchPolicy: "network-only",
    },
  );

  const refetchOptions = { refetchQueries: tasksBoardRefetchQueries, awaitRefetchQueries: true };

  const [markRead] = useMutation(MarkTaskCommentsReadDocument, refetchOptions);
  const [addComment, { loading: posting }] = useMutation(AddTaskCommentDocument, refetchOptions);
  const [deleteComment] = useMutation(DeleteTaskCommentDocument, refetchOptions);

  const handleTargetVisible = useCallback(
    (target: CommentsTarget) => {
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
