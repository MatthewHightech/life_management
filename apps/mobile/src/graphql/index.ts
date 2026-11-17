import type { TaskCommentsQuery, TaskProjectsQuery, TasksBoardQuery } from "./generated/graphql";

export * from "./generated/graphql";

export type BoardTask = TasksBoardQuery["tasks"][number];
export type HouseholdUser = NonNullable<TasksBoardQuery["household"]>["users"][number];
export type TaskComment = TaskCommentsQuery["taskComments"][number];
export type TaskProject = TaskProjectsQuery["taskProjects"][number];
