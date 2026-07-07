export const taskTypeDefs = `#graphql
  enum TaskStatus {
    BACKLOG
    TODO
    IN_PROGRESS
    WAITING
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
    LIST
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

  type SubtaskProgress {
    completed: Int!
    total: Int!
    percent: Int!
  }

  type TaskComment {
    id: ID!
    body: String!
    author: User!
    createdAt: String!
    canDelete: Boolean!
  }

  type Task {
    id: ID!
    title: String!
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
    assignees: [User!]!
    createdBy: User!
    subtasks: [Task!]!
    subtaskProgress: SubtaskProgress!
    blockedBy: [TaskDependency!]!
    isBlocked: Boolean!
    isOverdue: Boolean!
    commentCount: Int!
    unreadCommentCount: Int!
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
    status: TaskStatus
    priority: TaskPriority
    isShared: Boolean
    dueDate: String
    remindAt: String
    projectId: ID
    parentId: ID
    assigneeIds: [ID!]
    isRecurringTemplate: Boolean
    recurrenceFrequency: RecurrenceFrequency
    recurrenceInterval: Int
    recurrenceWeekdays: [Int!]
  }

  input UpdateTaskInput {
    title: String
    status: TaskStatus
    priority: TaskPriority
    isShared: Boolean
    dueDate: String
    remindAt: String
    projectId: ID
    parentId: ID
    assigneeIds: [ID!]
    isRecurringTemplate: Boolean
    recurrenceFrequency: RecurrenceFrequency
    recurrenceInterval: Int
    recurrenceWeekdays: [Int!]
  }

  extend type Query {
    tasks(filter: TaskFilterInput): [Task!]!
    task(id: ID!): Task
    taskProjects: [TaskProject!]!
    taskComments(taskId: ID!): [TaskComment!]!
  }

  extend type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    moveTask(id: ID!, status: TaskStatus!): Task!
    deleteTask(id: ID!): Boolean!
    clearDoneTasks: Int!
    completeTask(id: ID!, completed: Boolean!): Task!
    addTaskComment(taskId: ID!, body: String!): TaskComment!
    deleteTaskComment(id: ID!): Boolean!
    markTaskCommentsRead(taskId: ID!): Boolean!
    createTaskProject(name: String!): TaskProject!
    addTaskDependency(taskId: ID!, dependsOnTaskId: ID!): Task!
    removeTaskDependency(taskId: ID!, dependsOnTaskId: ID!): Task!
  }
`;
