import { gql } from "@apollo/client";

const TASK_FIELDS = gql`
  fragment TaskFields on Task {
    id
    title
    description
    status
    priority
    isShared
    dueDate
    completedAt
    isBlocked
    isOverdue
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
  mutation MoveTask($id: ID!, $status: TaskStatus!) {
    moveTask(id: $id, status: $status) {
      ...TaskFields
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
      ...TaskFields
    }
  }
`;
