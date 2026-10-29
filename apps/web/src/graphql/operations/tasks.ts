import { gql } from "@apollo/client";

const TASK_FIELDS = gql`
  fragment TaskFields on Task {
    id
    title
    status
    priority
    isShared
    dueDate
    completedAt
    isBlocked
    isOverdue
    commentCount
    unreadCommentCount
    subtaskProgress {
      completed
      total
      percent
    }
    assignees {
      id
      name
      email
      image
    }
    project {
      id
      name
    }
  }
`;

const TASK_COMMENT_FIELDS = gql`
  fragment TaskCommentFields on TaskComment {
    id
    body
    createdAt
    canDelete
    author {
      id
      name
      email
      image
    }
  }
`;

export const HOUSEHOLD_SHELL_QUERY = gql`
  query HouseholdShell {
    me {
      id
      name
      email
      image
    }
    household {
      id
      name
      users {
        id
        name
        email
        image
      }
    }
  }
`;

export const TASKS_BOARD_QUERY = gql`
  ${TASK_FIELDS}
  query TasksBoard($filter: TaskFilterInput) {
    tasks(filter: $filter) {
      ...TaskFields
    }
    me {
      id
      name
      email
      image
    }
    household {
      id
      users {
        id
        name
        email
        image
      }
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  ${TASK_FIELDS}
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      ...TaskFields
    }
  }
`;

export const MOVE_TASK_MUTATION = gql`
  ${TASK_FIELDS}
  mutation MoveTask($id: ID!, $status: TaskStatus!, $projectId: ID) {
    moveTask(id: $id, status: $status, projectId: $projectId) {
      ...TaskFields
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const CLEAR_DONE_TASKS_MUTATION = gql`
  mutation ClearDoneTasks($projectId: ID) {
    clearDoneTasks(projectId: $projectId)
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  ${TASK_FIELDS}
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      ...TaskFields
    }
  }
`;

export const TASK_COMMENTS_QUERY = gql`
  ${TASK_COMMENT_FIELDS}
  query TaskComments($taskId: ID!) {
    taskComments(taskId: $taskId) {
      ...TaskCommentFields
    }
  }
`;

export const ADD_TASK_COMMENT_MUTATION = gql`
  ${TASK_COMMENT_FIELDS}
  mutation AddTaskComment($taskId: ID!, $body: String!) {
    addTaskComment(taskId: $taskId, body: $body) {
      ...TaskCommentFields
    }
  }
`;

export const DELETE_TASK_COMMENT_MUTATION = gql`
  mutation DeleteTaskComment($id: ID!) {
    deleteTaskComment(id: $id)
  }
`;

export const MARK_TASK_COMMENTS_READ_MUTATION = gql`
  mutation MarkTaskCommentsRead($taskId: ID!) {
    markTaskCommentsRead(taskId: $taskId)
  }
`;

export const TASK_PROJECTS_QUERY = gql`
  query TaskProjects {
    taskProjects {
      id
      name
      sortOrder
      taskCount
    }
  }
`;

export const CREATE_TASK_PROJECT_MUTATION = gql`
  mutation CreateTaskProject($name: String!) {
    createTaskProject(name: $name) {
      id
      name
      sortOrder
      taskCount
    }
  }
`;

export const RENAME_TASK_PROJECT_MUTATION = gql`
  mutation RenameTaskProject($id: ID!, $name: String!) {
    renameTaskProject(id: $id, name: $name) {
      id
      name
      sortOrder
      taskCount
    }
  }
`;

export const REORDER_TASK_PROJECTS_MUTATION = gql`
  mutation ReorderTaskProjects($ids: [ID!]!) {
    reorderTaskProjects(ids: $ids) {
      id
      name
      sortOrder
      taskCount
    }
  }
`;

export const DELETE_TASK_PROJECT_MUTATION = gql`
  mutation DeleteTaskProject($id: ID!, $moveTasksToProjectId: ID) {
    deleteTaskProject(id: $id, moveTasksToProjectId: $moveTasksToProjectId)
  }
`;
