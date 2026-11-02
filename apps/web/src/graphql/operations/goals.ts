import { gql } from "@apollo/client";

const GOAL_FIELDS = gql`
  fragment GoalFields on Goal {
    id
    title
    completedAt
    sortOrder
    createdAt
    updatedAt
  }
`;

const GOAL_SET_FIELDS = gql`
  ${GOAL_FIELDS}
  fragment GoalSetFields on GoalSet {
    id
    cadence
    label
    archivedAt
    createdAt
    completedCount
    totalCount
    isComplete
    user {
      id
      name
      email
      image
    }
    goals {
      ...GoalFields
    }
  }
`;

const GOAL_CADENCE_STATS_FIELDS = gql`
  fragment GoalCadenceStatsFields on GoalCadenceStats {
    cadence
    hitRate
    streak
    archivedSetCount
  }
`;

export const CURRENT_GOALS_QUERY = gql`
  ${GOAL_SET_FIELDS}
  query CurrentGoals {
    currentGoals {
      members {
        id
        name
        email
        image
      }
      sets {
        ...GoalSetFields
      }
    }
    me {
      id
    }
  }
`;

export const PAST_GOALS_QUERY = gql`
  ${GOAL_SET_FIELDS}
  ${GOAL_CADENCE_STATS_FIELDS}
  query PastGoals($limit: Int = 4, $offset: Int = 0) {
    pastGoals(limit: $limit, offset: $offset) {
      stats {
        user {
          id
          name
          email
          image
        }
        daily {
          ...GoalCadenceStatsFields
        }
        weekly {
          ...GoalCadenceStatsFields
        }
        term {
          ...GoalCadenceStatsFields
        }
      }
      daily {
        ...GoalSetFields
      }
      weekly {
        ...GoalSetFields
      }
      term {
        ...GoalSetFields
      }
      hasMoreDaily
      hasMoreWeekly
      hasMoreTerm
    }
  }
`;

export const CREATE_GOAL_MUTATION = gql`
  ${GOAL_SET_FIELDS}
  mutation CreateGoal($cadence: GoalCadence!, $title: String!) {
    createGoal(cadence: $cadence, title: $title) {
      ...GoalSetFields
    }
  }
`;

export const UPDATE_GOAL_MUTATION = gql`
  ${GOAL_FIELDS}
  mutation UpdateGoal($id: ID!, $title: String!) {
    updateGoal(id: $id, title: $title) {
      ...GoalFields
    }
  }
`;

export const SET_GOAL_COMPLETED_MUTATION = gql`
  ${GOAL_FIELDS}
  mutation SetGoalCompleted($id: ID!, $completed: Boolean!) {
    setGoalCompleted(id: $id, completed: $completed) {
      ...GoalFields
    }
  }
`;

export const DELETE_GOAL_MUTATION = gql`
  mutation DeleteGoal($id: ID!) {
    deleteGoal(id: $id)
  }
`;

export const RESET_GOALS_MUTATION = gql`
  mutation ResetGoals($cadence: GoalCadence!) {
    resetGoals(cadence: $cadence)
  }
`;
