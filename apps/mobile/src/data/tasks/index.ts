import { useMutation, useQuery } from "@apollo/client/react";
import { groupTasksByStatus, partitionListTasks } from "@life/shared";
import { useCallback, useMemo } from "react";
import {
  ADD_TASK_COMMENT_MUTATION,
  CREATE_TASK_MUTATION,
  DELETE_TASK_COMMENT_MUTATION,
  DELETE_TASK_MUTATION,
  MARK_TASK_COMMENTS_READ_MUTATION,
  MOVE_TASK_MUTATION,
  TASK_COMMENTS_QUERY,
  UPDATE_TASK_MUTATION,
  type CreateTaskInput,
  type TaskStatus,
  type UpdateTaskInput,
} from "@/src/graphql";
import {
  prependTaskInBoardCache,
  removeTaskFromBoardCache,
  tasksBoardListQuery,
  tasksBoardRefetchQueries,
  updateTaskInBoardCache,
} from "./cache";
import { useRefetchOnFocus } from "../use-refetch-on-focus";

export function useTasksBoard() {
  const query = useQuery(tasksBoardListQuery.query, {
    variables: tasksBoardListQuery.variables,
    notifyOnNetworkStatusChange: true,
  });

  const refresh = useCallback(() => query.refetch(), [query]);
  useRefetchOnFocus(refresh);

  const tasks = query.data?.tasks ?? [];

  const partitioned = useMemo(() => partitionListTasks(tasks), [tasks]);
  const tasksByStatus = useMemo(() => groupTasksByStatus(tasks), [tasks]);

  return {
    ...query,
    tasks,
    tasksByStatus,
    activeTasks: partitioned.activeTasks,
    doneTasks: partitioned.doneTasks,
    users: query.data?.household?.users ?? [],
    me: query.data?.me ?? null,
    refresh,
  };
}

export function useTaskMutations() {
  const [createTaskMutation, createState] = useMutation(CREATE_TASK_MUTATION, {
    update(cache, result) {
      const created = result.data?.createTask;
      if (created) {
        prependTaskInBoardCache(cache, created);
      }
    },
  });

  const [updateTaskMutation, updateState] = useMutation(UPDATE_TASK_MUTATION, {
    update(cache, result) {
      const updated = result.data?.updateTask;
      if (updated) {
        updateTaskInBoardCache(cache, updated);
      }
    },
  });

  const [moveTaskMutation, moveState] = useMutation(MOVE_TASK_MUTATION, {
    update(cache, result) {
      const updated = result.data?.moveTask;
      if (updated) {
        updateTaskInBoardCache(cache, updated);
      }
    },
  });

  const [deleteTaskMutation, deleteState] = useMutation(DELETE_TASK_MUTATION, {
    update(cache, result, options) {
      const id = options.variables?.id;
      if (result.data?.deleteTask && id) {
        removeTaskFromBoardCache(cache, id);
      }
    },
  });

  const createTask = useCallback(
    (input: CreateTaskInput) => createTaskMutation({ variables: { input } }),
    [createTaskMutation],
  );

  const updateTask = useCallback(
    (id: string, input: UpdateTaskInput) => updateTaskMutation({ variables: { id, input } }),
    [updateTaskMutation],
  );

  const moveTask = useCallback(
    (id: string, status: TaskStatus) => moveTaskMutation({ variables: { id, status } }),
    [moveTaskMutation],
  );

  const deleteTask = useCallback(
    (id: string) => deleteTaskMutation({ variables: { id } }),
    [deleteTaskMutation],
  );

  return {
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    creating: createState.loading,
    updating: updateState.loading,
    moving: moveState.loading,
    deleting: deleteState.loading,
  };
}

export function useTaskComments(taskId: string | undefined) {
  const query = useQuery(TASK_COMMENTS_QUERY, {
    variables: { taskId: taskId ?? "" },
    skip: !taskId,
    fetchPolicy: "network-only",
  });

  const [addCommentMutation, addState] = useMutation(ADD_TASK_COMMENT_MUTATION, {
    refetchQueries: tasksBoardRefetchQueries,
  });
  const [deleteCommentMutation] = useMutation(DELETE_TASK_COMMENT_MUTATION, {
    refetchQueries: tasksBoardRefetchQueries,
  });
  const [markReadMutation] = useMutation(MARK_TASK_COMMENTS_READ_MUTATION, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  const markRead = useCallback(async () => {
    if (!taskId) {
      return;
    }
    await markReadMutation({ variables: { taskId } });
    await query.refetch({ taskId });
  }, [markReadMutation, query, taskId]);

  const refresh = useCallback(
    () => (taskId ? query.refetch({ taskId }) : Promise.resolve()),
    [query, taskId],
  );
  useRefetchOnFocus(refresh, Boolean(taskId));

  const addComment = useCallback(
    async (body: string) => {
      if (!taskId) {
        return;
      }
      await addCommentMutation({ variables: { taskId, body } });
      await query.refetch({ taskId });
    },
    [addCommentMutation, query, taskId],
  );

  const deleteComment = useCallback(
    async (id: string) => {
      await deleteCommentMutation({ variables: { id } });
      if (taskId) {
        await query.refetch({ taskId });
      }
    },
    [deleteCommentMutation, query, taskId],
  );

  return {
    comments: query.data?.taskComments ?? [],
    loading: query.loading,
    error: query.error,
    posting: addState.loading,
    refresh,
    markRead,
    addComment,
    deleteComment,
  };
}
