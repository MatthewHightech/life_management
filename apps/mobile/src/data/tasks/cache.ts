import type { ApolloCache } from "@apollo/client";
import {
  TasksBoardDocument,
  type BoardTask,
  type TasksBoardQuery,
  type TasksBoardQueryVariables,
} from "@/src/graphql";

export const tasksBoardListQuery = {
  query: TasksBoardDocument,
  variables: {
    filter: { view: "LIST" as const, includeDone: true },
  } satisfies TasksBoardQueryVariables,
};

function updateBoardTasks(cache: ApolloCache<object>, update: (tasks: BoardTask[]) => BoardTask[]) {
  cache.updateQuery<TasksBoardQuery, TasksBoardQueryVariables>(tasksBoardListQuery, (existing) =>
    existing ? { ...existing, tasks: update(existing.tasks) } : existing,
  );
}

export function updateTaskInBoardCache(cache: ApolloCache<object>, updatedTask: BoardTask) {
  updateBoardTasks(cache, (tasks) =>
    tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
  );
}

export function removeTaskFromBoardCache(cache: ApolloCache<object>, taskId: string) {
  updateBoardTasks(cache, (tasks) => tasks.filter((task) => task.id !== taskId));

  const cacheId = cache.identify({ __typename: "Task", id: taskId });
  if (cacheId) {
    cache.evict({ id: cacheId });
    cache.gc();
  }
}

export function prependTaskInBoardCache(cache: ApolloCache<object>, createdTask: BoardTask) {
  updateBoardTasks(cache, (tasks) =>
    tasks.some((task) => task.id === createdTask.id) ? tasks : [createdTask, ...tasks],
  );
}
