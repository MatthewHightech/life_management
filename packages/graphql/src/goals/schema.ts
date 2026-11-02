export const goalTypeDefs = /* GraphQL */ `
  enum GoalCadence {
    DAILY
    WEEKLY
    TERM
  }

  type Goal {
    id: ID!
    title: String!
    completedAt: String
    sortOrder: Int!
    createdAt: String!
    updatedAt: String!
  }

  type GoalSet {
    id: ID!
    cadence: GoalCadence!
    label: String!
    archivedAt: String
    createdAt: String!
    user: User!
    goals: [Goal!]!
    completedCount: Int!
    totalCount: Int!
    isComplete: Boolean!
  }

  type GoalCadenceStats {
    cadence: GoalCadence!
    hitRate: Float!
    streak: Int!
    archivedSetCount: Int!
  }

  type GoalMemberStats {
    user: User!
    daily: GoalCadenceStats!
    weekly: GoalCadenceStats!
    term: GoalCadenceStats!
  }

  type CurrentGoalsBoard {
    members: [User!]!
    sets: [GoalSet!]!
  }

  type PastGoalsArchive {
    stats: [GoalMemberStats!]!
    daily: [GoalSet!]!
    weekly: [GoalSet!]!
    term: [GoalSet!]!
    hasMoreDaily: Boolean!
    hasMoreWeekly: Boolean!
    hasMoreTerm: Boolean!
  }

  extend type Query {
    currentGoals: CurrentGoalsBoard!
    pastGoals(limit: Int = 4, offset: Int = 0): PastGoalsArchive!
  }

  extend type Mutation {
    createGoal(cadence: GoalCadence!, title: String!): GoalSet!
    updateGoal(id: ID!, title: String!): Goal!
    setGoalCompleted(id: ID!, completed: Boolean!): Goal!
    deleteGoal(id: ID!): Boolean!
    resetGoals(cadence: GoalCadence!): Boolean!
  }
`;
