import type { ApolloCache } from "@apollo/client";
import type { TasksBoardQuery, TasksBoardQueryVariables } from "@/graphql";
import { TASK_PROJECTS_QUERY, TASKS_BOARD_QUERY } from "@/graphql";

export const tasksBoardListQuery = {
  query: TASKS_BOARD_QUERY,
  variables: { filter: { view: "LIST" as const, includeDone: true } },
};

export const tasksBoardKanbanQuery = {
  query: TASKS_BOARD_QUERY,
  variables: { filter: { view: "KANBAN" as const, includeDone: true } },
};

const taskListCaches = [tasksBoardListQuery, tasksBoardKanbanQuery];

/** Refetch list, kanban, and board tabs after a task mutation so counts stay current. */
export const tasksBoardRefetchQueries = [...taskListCaches, TASK_PROJECTS_QUERY];

type BoardTask = TasksBoardQuery["tasks"][number];

export function updateTaskInBoardCaches(cache: ApolloCache<unknown>, updatedTask: BoardTask) {
  for (const { query, variables } of taskListCaches) {
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
