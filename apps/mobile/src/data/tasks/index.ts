import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback } from "react";
import {
  AddTaskCommentDocument,
  CreateTaskDocument,
  CreateTaskProjectDocument,
  DeleteTaskCommentDocument,
  DeleteTaskDocument,
  MarkTaskCommentsReadDocument,
  MoveTaskDocument,
  TaskCommentsDocument,
  TaskProjectsDocument,
  UpdateTaskDocument,
  type CreateTaskInput,
  type TaskStatus,
  type UpdateTaskInput,
} from "@/src/graphql";
import {
  prependTaskInBoardCache,
  removeTaskFromBoardCache,
  tasksBoardListQuery,
  updateTaskInBoardCache,
} from "./cache";
import { useRefetchOnFocus } from "../use-refetch-on-focus";

export function tasksOnProject<T extends { project?: { id: string } | null }>(
  tasks: T[],
  projectId: string | null,
  fallbackProjectId: string | null,
): T[] {
  if (!projectId) {
    return [];
  }

  return tasks.filter((task) => (task.project?.id ?? fallbackProjectId) === projectId);
}

export function useTasksBoard() {
  const query = useQuery(tasksBoardListQuery.query, {
    variables: tasksBoardListQuery.variables,
    notifyOnNetworkStatusChange: true,
  });

  const refresh = useCallback(() => query.refetch(), [query]);
  useRefetchOnFocus(refresh);

  return {
    ...query,
    tasks: query.data?.tasks ?? [],
    users: query.data?.household?.users ?? [],
    me: query.data?.me ?? null,
    refresh,
  };
}

export function useTaskProjects() {
  const query = useQuery(TaskProjectsDocument, {
    notifyOnNetworkStatusChange: true,
  });

  const [createTaskProject, createState] = useMutation(CreateTaskProjectDocument, {
    refetchQueries: [{ query: TaskProjectsDocument }, tasksBoardListQuery],
    awaitRefetchQueries: true,
  });

  const refresh = useCallback(() => query.refetch(), [query]);
  useRefetchOnFocus(refresh);

  const createProject = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        return null;
      }
      const result = await createTaskProject({ variables: { name: trimmed } });
      return result.data?.createTaskProject ?? null;
    },
    [createTaskProject],
  );

  return {
    projects: query.data?.taskProjects ?? [],
    loading: query.loading,
    refresh,
    createProject,
    creating: createState.loading,
  };
}

export function useTaskMutations() {
  const [createTaskMutation, createState] = useMutation(CreateTaskDocument, {
    update(cache, result) {
      const created = result.data?.createTask;
      if (created) {
        prependTaskInBoardCache(cache, created);
      }
    },
  });

  const [updateTaskMutation, updateState] = useMutation(UpdateTaskDocument, {
    update(cache, result) {
      const updated = result.data?.updateTask;
      if (updated) {
        updateTaskInBoardCache(cache, updated);
      }
    },
  });

  const [moveTaskMutation] = useMutation(MoveTaskDocument, {
    update(cache, result) {
      const updated = result.data?.moveTask;
      if (updated) {
        updateTaskInBoardCache(cache, updated);
      }
    },
  });

  const [deleteTaskMutation, deleteState] = useMutation(DeleteTaskDocument, {
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
    deleting: deleteState.loading,
  };
}

export function useTaskComments(taskId: string | undefined) {
  const query = useQuery(TaskCommentsDocument, {
    variables: { taskId: taskId ?? "" },
    skip: !taskId,
    fetchPolicy: "network-only",
  });

  const [addCommentMutation, addState] = useMutation(AddTaskCommentDocument, {
    refetchQueries: [tasksBoardListQuery],
  });
  const [deleteCommentMutation] = useMutation(DeleteTaskCommentDocument, {
    refetchQueries: [tasksBoardListQuery],
  });
  const [markReadMutation] = useMutation(MarkTaskCommentsReadDocument, {
    refetchQueries: [tasksBoardListQuery],
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
    posting: addState.loading,
    markRead,
    addComment,
    deleteComment,
  };
}
