"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";
import { useComments, type CommentsTarget } from "@/components/comments/comments-context";
import { CommentsSidebar } from "@/components/comments/comments-sidebar";
import { TaskDetailFields } from "@/components/tasks/task-detail-fields";
import { useTaskActions } from "@/components/tasks/use-board-tasks";
import {
  AddTaskCommentDocument,
  DeleteTaskCommentDocument,
  MarkTaskCommentsReadDocument,
  TaskCommentsDocument,
  TasksBoardDocument,
} from "@/graphql";
import type { TaskCommentsQuery, TaskCommentsQueryVariables, TasksBoardQuery } from "@/graphql";
import { tasksBoardListQuery, tasksBoardRefetchQueries } from "@/lib/task-board-queries";

export function TaskCommentsSidebar() {
  const { activeTarget: activeTask, closeComments } = useComments();
  const { onUpdate, onDelete } = useTaskActions();

  const { data: boardData } = useQuery<TasksBoardQuery>(TasksBoardDocument, {
    ...tasksBoardListQuery,
    skip: !activeTask,
  });

  const task = useMemo(
    () => boardData?.tasks.find((entry) => entry.id === activeTask?.id) ?? null,
    [activeTask?.id, boardData?.tasks],
  );
  const users = boardData?.household?.users ?? [];

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
      eyebrow="Task"
      details={
        task ? (
          <TaskDetailFields
            task={task}
            users={users}
            onUpdate={(input) => onUpdate(task.id, input)}
            onDelete={() => {
              onDelete(task.id);
              closeComments();
            }}
          />
        ) : null
      }
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
