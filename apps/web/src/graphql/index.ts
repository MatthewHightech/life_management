export {
  CreateTaskDocument as CREATE_TASK_MUTATION,
  DeleteTaskDocument as DELETE_TASK_MUTATION,
  HouseholdShellDocument as HOUSEHOLD_SHELL_QUERY,
  MoveTaskDocument as MOVE_TASK_MUTATION,
  TasksBoardDocument as TASKS_BOARD_QUERY,
  UpdateTaskDocument as UPDATE_TASK_MUTATION,
} from "./generated/graphql";

export type {
  CreateTaskMutation,
  CreateTaskMutationVariables,
  DeleteTaskMutation,
  DeleteTaskMutationVariables,
  HouseholdShellQuery,
  HouseholdShellQueryVariables,
  MoveTaskMutation,
  MoveTaskMutationVariables,
  TaskPriority,
  TasksBoardQuery,
  TasksBoardQueryVariables,
  TaskStatus,
  TaskView,
  UpdateTaskMutation,
  UpdateTaskMutationVariables,
} from "./generated/graphql";
