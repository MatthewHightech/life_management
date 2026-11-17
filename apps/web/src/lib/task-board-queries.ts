import type { ApolloCache } from "@apollo/client";
import type { TasksBoardQuery, TasksBoardQueryVariables } from "@/graphql";
import { TaskProjectsDocument, TasksBoardDocument } from "@/graphql";

export const tasksBoardListQuery = {
  query: TasksBoardDocument,
  variables: { filter: { view: "LIST" as const, includeDone: true } },
};

export const tasksBoardKanbanQuery = {
  query: TasksBoardDocument,
  variables: { filter: { view: "KANBAN" as const, includeDone: true } },
};

export const tasksBoardCalendarQuery = {
  query: TasksBoardDocument,
  variables: { filter: { view: "CALENDAR" as const, includeDone: true } },
};

const taskListCaches = [tasksBoardListQuery, tasksBoardKanbanQuery, tasksBoardCalendarQuery];

/** Refetch list, kanban, calendar, and board tabs after a task mutation so counts stay current. */
export const tasksBoardRefetchQueries = [...taskListCaches, TaskProjectsDocument];

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
