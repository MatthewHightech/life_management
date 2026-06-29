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
