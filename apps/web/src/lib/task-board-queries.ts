import type { ApolloCache } from "@apollo/client";
import type { TasksBoardQuery, TasksBoardQueryVariables } from "@/graphql";
import { TASKS_BOARD_QUERY } from "@/graphql";

export const tasksBoardListQuery = {
  query: TASKS_BOARD_QUERY,
  variables: { filter: { view: "LIST" as const, includeDone: true } },
};

export const tasksBoardKanbanQuery = {
  query: TASKS_BOARD_QUERY,
  variables: { filter: { view: "KANBAN" as const, includeDone: true } },
};

/** Refetch both list and kanban caches after any task mutation. */
export const tasksBoardRefetchQueries = [tasksBoardListQuery, tasksBoardKanbanQuery];

type BoardTask = TasksBoardQuery["tasks"][number];

export function updateTaskInBoardCaches(cache: ApolloCache<unknown>, updatedTask: BoardTask) {
  for (const { query, variables } of tasksBoardRefetchQueries) {
    cache.updateQuery<TasksBoardQuery, TasksBoardQueryVariables>(
      { query, variables },
      (existing) => {
        if (!existing) {
          return existing;
        }

        return {
          ...existing,
          tasks: existing.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        };
      },
    );
  }
}
