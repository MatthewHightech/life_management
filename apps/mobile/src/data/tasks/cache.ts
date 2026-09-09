import type { ApolloCache } from "@apollo/client";
import {
  TASKS_BOARD_QUERY,
  type BoardTask,
  type TasksBoardQuery,
  type TasksBoardQueryVariables,
} from "@/src/graphql";

/** Canonical list-view board query used by the Tasks module. */
export const tasksBoardListQuery = {
  query: TASKS_BOARD_QUERY,
  variables: {
    filter: { view: "LIST" as const, includeDone: true },
  } satisfies TasksBoardQueryVariables,
};

export const tasksBoardRefetchQueries = [tasksBoardListQuery];

export function updateTaskInBoardCache(cache: ApolloCache<object>, updatedTask: BoardTask) {
  cache.updateQuery<TasksBoardQuery, TasksBoardQueryVariables>(tasksBoardListQuery, (existing) => {
    if (!existing) {
      return existing;
    }

    return {
      ...existing,
      tasks: existing.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    };
  });
}

export function removeTaskFromBoardCache(cache: ApolloCache<object>, taskId: string) {
  cache.updateQuery<TasksBoardQuery, TasksBoardQueryVariables>(tasksBoardListQuery, (existing) => {
    if (!existing) {
      return existing;
    }

    return {
      ...existing,
      tasks: existing.tasks.filter((task) => task.id !== taskId),
    };
  });

  const cacheId = cache.identify({ __typename: "Task", id: taskId });
  if (cacheId) {
    cache.evict({ id: cacheId });
    cache.gc();
  }
}

export function prependTaskInBoardCache(cache: ApolloCache<object>, createdTask: BoardTask) {
  cache.updateQuery<TasksBoardQuery, TasksBoardQueryVariables>(tasksBoardListQuery, (existing) => {
    if (!existing) {
      return existing;
    }

    if (existing.tasks.some((task) => task.id === createdTask.id)) {
      return existing;
    }

    return {
      ...existing,
      tasks: [createdTask, ...existing.tasks],
    };
  });
}
