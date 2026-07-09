export const financeTypeDefs = /* GraphQL */ `
  enum BudgetLineType {
    MONTHLY
    ANNUAL
  }

  enum BudgetPurchaseSource {
    MANUAL
    VISA
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

  type BudgetPurchase {
    id: ID!
    name: String!
    amountCents: Int!
    purchaseDate: String!
    source: BudgetPurchaseSource!
  }

  type BudgetPurchaseAllocation {
    id: ID!
    purchaseId: ID!
    lineItemId: ID!
    amountCents: Int!
    purchaseName: String!
    purchaseDate: String!
    source: BudgetPurchaseSource!
  }

  type BudgetMonthView {
    year: Int!
    month: Int!
    title: String!
    annualTitle: String!
    purchases: [BudgetPurchase!]!
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

  input CreateBudgetPurchaseInput {
    name: String!
    amountCents: Int!
    purchaseDate: String!
  }

  input UpdateBudgetPurchaseInput {
    name: String
    amountCents: Int
    purchaseDate: String
  }

  extend type Query {
    budgetMonth: BudgetMonthView!
    budgetLineAllocations(lineItemId: ID!): [BudgetPurchaseAllocation!]!
  }

  extend type Mutation {
    createBudgetSection(name: String!, scope: BudgetLineType!): BudgetSection!
    updateBudgetSection(id: ID!, name: String!): BudgetSection!
    deleteBudgetSection(id: ID!): Boolean!
    createBudgetLineItem(input: CreateBudgetLineItemInput!): BudgetLineItem!
    updateBudgetLineItem(id: ID!, input: UpdateBudgetLineItemInput!): BudgetLineItem!
    deleteBudgetLineItem(id: ID!): Boolean!
    createBudgetPurchase(input: CreateBudgetPurchaseInput!): BudgetPurchase!
    updateBudgetPurchase(id: ID!, input: UpdateBudgetPurchaseInput!): BudgetPurchase!
    deleteBudgetPurchase(id: ID!): Boolean!
    allocateBudgetPurchase(purchaseId: ID!, lineItemId: ID!): BudgetPurchaseAllocation!
    deleteBudgetPurchaseAllocation(id: ID!): Boolean!
  }
`;
