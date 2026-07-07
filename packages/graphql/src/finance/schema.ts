export const financeTypeDefs = /* GraphQL */ `
  enum BudgetLineType {
    MONTHLY
    ANNUAL
  }

  type BudgetLineItem {
    id: ID!
    sectionId: ID!
    name: String!
    amountCents: Int!
    spentCents: Int!
    remainingCents: Int!
    progressPercent: Int!
  }

  type BudgetSection {
    id: ID!
    name: String!
    lineItems: [BudgetLineItem!]!
    budgetCents: Int!
    spentCents: Int!
    remainingCents: Int!
    progressPercent: Int!
  }

  type BudgetMonthView {
    year: Int!
    month: Int!
    title: String!
    annualTitle: String!
    monthlySections: [BudgetSection!]!
    annualSections: [BudgetSection!]!
  }

  input CreateBudgetLineItemInput {
    sectionId: ID!
    name: String!
    amountCents: Int!
  }

  input UpdateBudgetLineItemInput {
    name: String
    amountCents: Int
  }

  extend type Query {
    budgetMonth: BudgetMonthView!
  }

  extend type Mutation {
    createBudgetSection(name: String!, scope: BudgetLineType!): BudgetSection!
    updateBudgetSection(id: ID!, name: String!): BudgetSection!
    deleteBudgetSection(id: ID!): Boolean!
    createBudgetLineItem(input: CreateBudgetLineItemInput!): BudgetLineItem!
    updateBudgetLineItem(id: ID!, input: UpdateBudgetLineItemInput!): BudgetLineItem!
    deleteBudgetLineItem(id: ID!): Boolean!
  }
`;
