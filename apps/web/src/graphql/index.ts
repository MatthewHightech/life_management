export {
  CompleteTaskDocument as COMPLETE_TASK_MUTATION,
  CreateTaskDocument as CREATE_TASK_MUTATION,
  DeleteTaskDocument as DELETE_TASK_MUTATION,
  TasksDocument as TASKS_QUERY,
  UpdateTaskDocument as UPDATE_TASK_MUTATION,
} from "./generated/graphql";

export type {
  CompleteTaskMutation,
  CompleteTaskMutationVariables,
  CreateTaskMutation,
  CreateTaskMutationVariables,
  DeleteTaskMutation,
  DeleteTaskMutationVariables,
  TaskPriority,
  TasksQuery,
  TasksQueryVariables,
  TaskStatus,
  TaskView,
  UpdateTaskMutation,
  UpdateTaskMutationVariables,
} from "./generated/graphql";
