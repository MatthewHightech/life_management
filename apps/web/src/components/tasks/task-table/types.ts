import type { TasksBoardQuery, UpdateTaskMutationVariables } from "@/graphql";

export type BoardTask = TasksBoardQuery["tasks"][number];
export type HouseholdUser = NonNullable<TasksBoardQuery["household"]>["users"][number];
export type TaskUpdateInput = UpdateTaskMutationVariables["input"];

export type TaskTableRowProps = {
  task: BoardTask;
  onUpdate: (input: TaskUpdateInput) => Promise<void>;
};
