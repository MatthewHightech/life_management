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

  type BudgetReportPurchase {
    id: ID!
    name: String!
    purchaseDate: String!
    amountCents: Int!
  }

  type BudgetReportLineItem {
    id: ID!
    name: String!
    amountCents: Int!
    spentCents: Int!
    remainingCents: Int!
    progressPercent: Int!
    purchases: [BudgetReportPurchase!]!
  }

  type BudgetReportSection {
    id: ID!
    name: String!
    budgetCents: Int!
    spentCents: Int!
    remainingCents: Int!
    progressPercent: Int!
    spentDeltaCents: Int
    spentDeltaPercent: Int
    lineItems: [BudgetReportLineItem!]!
  }

  type BudgetReportComparison {
    spentDeltaCents: Int!
    spentDeltaPercent: Int!
  }

  type BudgetMonthReport {
    year: Int!
    month: Int!
    title: String!
    hasReport: Boolean!
    budgetCents: Int!
    spentCents: Int!
    remainingCents: Int!
    progressPercent: Int!
    overBudgetSectionNames: [String!]!
    comparison: BudgetReportComparison
    sections: [BudgetReportSection!]!
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
    budgetMonthReport(year: Int!, month: Int!): BudgetMonthReport!
    budgetLineAllocations(lineItemId: ID!): [BudgetPurchaseAllocation!]!
    bankConnections: [BankConnection!]!
  }

  type BankAccount {
    id: ID!
    plaidAccountId: String!
    name: String!
    officialName: String
    mask: String
    type: String!
    subtype: String
    syncEnabled: Boolean!
    isCreditCard: Boolean!
  }

  enum BankConnectionStatus {
    PENDING_SETUP
    ACTIVE
    ERROR
    DISCONNECTED
  }

  type BankConnection {
    id: ID!
    institutionId: String
    institutionName: String!
    status: BankConnectionStatus!
    lastSyncedAt: String
    lastError: String
    accounts: [BankAccount!]!
  }

  type PlaidLinkToken {
    linkToken: String!
    expiration: String!
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
    createPlaidLinkToken: PlaidLinkToken!
    completePlaidLink(publicToken: String!): BankConnection!
    updateBankAccountSync(connectionId: ID!, enabledAccountIds: [ID!]!): BankConnection!
    disconnectBankConnection(connectionId: ID!): Boolean!
    syncBankConnectionNow(connectionId: ID!): BankConnection!
  }
`;
