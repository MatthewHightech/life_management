import { gql } from "@apollo/client";

export const TASKS_QUERY = gql`
  query Tasks($filter: TaskFilterInput) {
    tasks(filter: $filter) {
      id
      title
      description
      status
      priority
      isShared
      dueDate
      completedAt
      isBlocked
      assignee {
        id
        name
        email
      }
      project {
        id
        name
      }
      subtasks {
        id
        title
        status
      }
    }
    me {
      id
      name
      email
    }
    household {
      id
      users {
        id
        name
        email
      }
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      status
      priority
      dueDate
      assignee {
        id
        name
      }
    }
  }
`;

export const COMPLETE_TASK_MUTATION = gql`
  mutation CompleteTask($id: ID!, $completed: Boolean!) {
    completeTask(id: $id, completed: $completed) {
      id
      status
      completedAt
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      status
      priority
    }
  }
`;
