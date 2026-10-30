export {
  AddTaskCommentDocument as ADD_TASK_COMMENT_MUTATION,
  CreateTaskDocument as CREATE_TASK_MUTATION,
  CreateTaskProjectDocument as CREATE_TASK_PROJECT_MUTATION,
  DeleteTaskCommentDocument as DELETE_TASK_COMMENT_MUTATION,
  DeleteTaskDocument as DELETE_TASK_MUTATION,
  HouseholdShellDocument as HOUSEHOLD_SHELL_QUERY,
  MarkTaskCommentsReadDocument as MARK_TASK_COMMENTS_READ_MUTATION,
  MoveTaskDocument as MOVE_TASK_MUTATION,
  TaskCommentsDocument as TASK_COMMENTS_QUERY,
  TaskProjectsDocument as TASK_PROJECTS_QUERY,
  TasksBoardDocument as TASKS_BOARD_QUERY,
  UpdateTaskDocument as UPDATE_TASK_MUTATION,
} from "./generated/graphql";

export type {
  AddTaskCommentMutation,
  AddTaskCommentMutationVariables,
  CreateTaskInput,
  CreateTaskMutation,
  CreateTaskMutationVariables,
  CreateTaskProjectMutation,
  CreateTaskProjectMutationVariables,
  DeleteTaskCommentMutation,
  DeleteTaskCommentMutationVariables,
  DeleteTaskMutation,
  DeleteTaskMutationVariables,
  HouseholdShellQuery,
  HouseholdShellQueryVariables,
  MarkTaskCommentsReadMutation,
  MarkTaskCommentsReadMutationVariables,
  MoveTaskMutation,
  MoveTaskMutationVariables,
  TaskCommentsQuery,
  TaskCommentsQueryVariables,
  TaskPriority,
  TaskProjectsQuery,
  TaskProjectsQueryVariables,
  TasksBoardQuery,
  TasksBoardQueryVariables,
  TaskStatus,
  UpdateTaskInput,
  UpdateTaskMutation,
  UpdateTaskMutationVariables,
} from "./generated/graphql";

export type BoardTask = import("./generated/graphql").TasksBoardQuery["tasks"][number];
export type HouseholdUser = NonNullable<
  import("./generated/graphql").TasksBoardQuery["household"]
>["users"][number];
export type TaskComment = import("./generated/graphql").TaskCommentsQuery["taskComments"][number];
export type TaskProject = import("./generated/graphql").TaskProjectsQuery["taskProjects"][number];
