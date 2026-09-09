import { gql } from "@apollo/client";

const TASK_FIELDS = gql`
  fragment MobileTaskFields on Task {
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
  fragment MobileTaskCommentFields on TaskComment {
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

export const TASKS_BOARD_QUERY = gql`
  ${TASK_FIELDS}
  query TasksBoard($filter: TaskFilterInput) {
    tasks(filter: $filter) {
      ...MobileTaskFields
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
      ...MobileTaskFields
    }
  }
`;

export const MOVE_TASK_MUTATION = gql`
  ${TASK_FIELDS}
  mutation MoveTask($id: ID!, $status: TaskStatus!) {
    moveTask(id: $id, status: $status) {
      ...MobileTaskFields
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  ${TASK_FIELDS}
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      ...MobileTaskFields
    }
  }
`;

export const TASK_COMMENTS_QUERY = gql`
  ${TASK_COMMENT_FIELDS}
  query TaskComments($taskId: ID!) {
    taskComments(taskId: $taskId) {
      ...MobileTaskCommentFields
    }
  }
`;

export const ADD_TASK_COMMENT_MUTATION = gql`
  ${TASK_COMMENT_FIELDS}
  mutation AddTaskComment($taskId: ID!, $body: String!) {
    addTaskComment(taskId: $taskId, body: $body) {
      ...MobileTaskCommentFields
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
