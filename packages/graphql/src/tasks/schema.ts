export const taskTypeDefs = `#graphql
  enum TaskStatus {
    TODO
    IN_PROGRESS
    DONE
  }

  enum TaskPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum RecurrenceFrequency {
    DAILY
    WEEKLY
    MONTHLY
  }

  enum TaskView {
    TODAY
    CALENDAR
    KANBAN
    BY_PERSON
  }

  type TaskProject {
    id: ID!
    name: String!
    taskCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type TaskDependency {
    id: ID!
    dependsOnTask: Task!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    priority: TaskPriority!
    isShared: Boolean!
    dueDate: String
    completedAt: String
    remindAt: String
    isRecurringTemplate: Boolean!
    recurrenceFrequency: RecurrenceFrequency
    recurrenceInterval: Int
    recurrenceWeekdays: [Int!]!
    project: TaskProject
    parentId: ID
    assignee: User
    createdBy: User!
    subtasks: [Task!]!
    blockedBy: [TaskDependency!]!
    isBlocked: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input TaskFilterInput {
    view: TaskView
    status: TaskStatus
    assigneeId: ID
    projectId: ID
    includeDone: Boolean
  }

  input CreateTaskInput {
    title: String!
    description: String
    status: TaskStatus
    priority: TaskPriority
    isShared: Boolean
    dueDate: String
    remindAt: String
    projectId: ID
    parentId: ID
    assigneeId: ID
    isRecurringTemplate: Boolean
    recurrenceFrequency: RecurrenceFrequency
    recurrenceInterval: Int
    recurrenceWeekdays: [Int!]
  }

  input UpdateTaskInput {
    title: String
    description: String
    status: TaskStatus
    priority: TaskPriority
    isShared: Boolean
    dueDate: String
    remindAt: String
    projectId: ID
    parentId: ID
    assigneeId: ID
    isRecurringTemplate: Boolean
    recurrenceFrequency: RecurrenceFrequency
    recurrenceInterval: Int
    recurrenceWeekdays: [Int!]
  }

  extend type Query {
    tasks(filter: TaskFilterInput): [Task!]!
    task(id: ID!): Task
    taskProjects: [TaskProject!]!
  }

  extend type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    completeTask(id: ID!, completed: Boolean!): Task!
    createTaskProject(name: String!): TaskProject!
    addTaskDependency(taskId: ID!, dependsOnTaskId: ID!): Task!
    removeTaskDependency(taskId: ID!, dependsOnTaskId: ID!): Task!
  }
`;
