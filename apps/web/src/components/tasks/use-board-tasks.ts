"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";
import type { TasksBoardQuery, TasksBoardQueryVariables } from "@/graphql";
import { DeleteTaskDocument, TasksBoardDocument, UpdateTaskDocument } from "@/graphql";
import { useTaskBoards } from "@/components/tasks/task-boards-context";
import type { TaskUpdateInput } from "@/components/tasks/task-table/types";
import { tasksOnBoard } from "@/lib/task-boards";
import { tasksBoardRefetchQueries } from "@/lib/task-board-queries";

export function useBoardTasks(variables: TasksBoardQueryVariables) {
  const { boards, boardsLoading, activeBoardId } = useTaskBoards();
  const { data, loading, error } = useQuery<TasksBoardQuery, TasksBoardQueryVariables>(TasksBoardDocument, {
    variables,
  });

  const tasks = useMemo(() => data?.tasks ?? [], [data?.tasks]);
  const fallbackBoardId = boards[0]?.id ?? null;
  const boardTasks = useMemo(
    () => tasksOnBoard(tasks, activeBoardId, fallbackBoardId),
    [activeBoardId, fallbackBoardId, tasks],
  );

  return {
    tasks,
    boardTasks,
    fallbackBoardId,
    users: data?.household?.users ?? [],
    currentUserId: data?.me?.id,
    waiting: loading || (boardsLoading && !activeBoardId),
    error,
  };
}

export function useTaskActions() {
  const [updateTask] = useMutation(UpdateTaskDocument, { refetchQueries: tasksBoardRefetchQueries });
  const [deleteTask] = useMutation(DeleteTaskDocument, { refetchQueries: tasksBoardRefetchQueries });

  const onUpdate = useCallback(
    async (id: string, input: TaskUpdateInput) => {
      await updateTask({ variables: { id, input } });
    },
    [updateTask],
  );

  const onDelete = useCallback(
    (id: string) => {
      void deleteTask({ variables: { id } });
    },
    [deleteTask],
  );

  return { onUpdate, onDelete };
}
