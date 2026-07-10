import { gql } from "@apollo/client";

const BUDGET_LINE_ITEM_FIELDS = gql`
  fragment BudgetLineItemFields on BudgetLineItem {
    id
    sectionId
    name
    amountCents
    spentCents
    remainingCents
    progressPercent
  }
`;

const BUDGET_SECTION_FIELDS = gql`
  ${BUDGET_LINE_ITEM_FIELDS}
  fragment BudgetSectionFields on BudgetSection {
    id
    name
    budgetCents
    spentCents
    remainingCents
    progressPercent
    lineItems {
      ...BudgetLineItemFields
    }
  }
`;

const BUDGET_PURCHASE_FIELDS = gql`
  fragment BudgetPurchaseFields on BudgetPurchase {
    id
    name
    amountCents
    purchaseDate
    source
  }
`;

const BUDGET_PURCHASE_ALLOCATION_FIELDS = gql`
  fragment BudgetPurchaseAllocationFields on BudgetPurchaseAllocation {
    id
    purchaseId
    lineItemId
    amountCents
    purchaseName
    purchaseDate
    source
  }
`;

export const BUDGET_MONTH_QUERY = gql`
  ${BUDGET_SECTION_FIELDS}
  ${BUDGET_PURCHASE_FIELDS}
  query BudgetMonth {
    budgetMonth {
      year
      month
      title
      annualTitle
      purchases {
        ...BudgetPurchaseFields
      }
      monthlySections {
        ...BudgetSectionFields
      }
      annualSections {
        ...BudgetSectionFields
      }
    }
  }
`;

export const BUDGET_LINE_ALLOCATIONS_QUERY = gql`
  ${BUDGET_PURCHASE_ALLOCATION_FIELDS}
  query BudgetLineAllocations($lineItemId: ID!) {
    budgetLineAllocations(lineItemId: $lineItemId) {
      ...BudgetPurchaseAllocationFields
    }
  }
`;

export const CREATE_BUDGET_SECTION_MUTATION = gql`
  ${BUDGET_SECTION_FIELDS}
  mutation CreateBudgetSection($name: String!, $scope: BudgetLineType!) {
    createBudgetSection(name: $name, scope: $scope) {
      ...BudgetSectionFields
    }
  }
`;

export const UPDATE_BUDGET_SECTION_MUTATION = gql`
  ${BUDGET_SECTION_FIELDS}
  mutation UpdateBudgetSection($id: ID!, $name: String!) {
    updateBudgetSection(id: $id, name: $name) {
      ...BudgetSectionFields
    }
  }
`;

export const DELETE_BUDGET_SECTION_MUTATION = gql`
  mutation DeleteBudgetSection($id: ID!) {
    deleteBudgetSection(id: $id)
  }
`;

export const CREATE_BUDGET_LINE_ITEM_MUTATION = gql`
  ${BUDGET_LINE_ITEM_FIELDS}
  mutation CreateBudgetLineItem($input: CreateBudgetLineItemInput!) {
    createBudgetLineItem(input: $input) {
      ...BudgetLineItemFields
    }
  }
`;

export const UPDATE_BUDGET_LINE_ITEM_MUTATION = gql`
  ${BUDGET_LINE_ITEM_FIELDS}
  mutation UpdateBudgetLineItem($id: ID!, $input: UpdateBudgetLineItemInput!) {
    updateBudgetLineItem(id: $id, input: $input) {
      ...BudgetLineItemFields
    }
  }
`;

export const DELETE_BUDGET_LINE_ITEM_MUTATION = gql`
  mutation DeleteBudgetLineItem($id: ID!) {
    deleteBudgetLineItem(id: $id)
  }
`;

export const CREATE_BUDGET_PURCHASE_MUTATION = gql`
  ${BUDGET_PURCHASE_FIELDS}
  mutation CreateBudgetPurchase($input: CreateBudgetPurchaseInput!) {
    createBudgetPurchase(input: $input) {
      ...BudgetPurchaseFields
    }
  }
`;

export const DELETE_BUDGET_PURCHASE_MUTATION = gql`
  mutation DeleteBudgetPurchase($id: ID!) {
    deleteBudgetPurchase(id: $id)
  }
`;

export const ALLOCATE_BUDGET_PURCHASE_MUTATION = gql`
  ${BUDGET_PURCHASE_ALLOCATION_FIELDS}
  mutation AllocateBudgetPurchase($purchaseId: ID!, $lineItemId: ID!) {
    allocateBudgetPurchase(purchaseId: $purchaseId, lineItemId: $lineItemId) {
      ...BudgetPurchaseAllocationFields
    }
  }
`;

export const UPDATE_BUDGET_PURCHASE_MUTATION = gql`
  ${BUDGET_PURCHASE_FIELDS}
  mutation UpdateBudgetPurchase($id: ID!, $input: UpdateBudgetPurchaseInput!) {
    updateBudgetPurchase(id: $id, input: $input) {
      ...BudgetPurchaseFields
    }
  }
`;

export const DELETE_BUDGET_PURCHASE_ALLOCATION_MUTATION = gql`
  mutation DeleteBudgetPurchaseAllocation($id: ID!) {
    deleteBudgetPurchaseAllocation(id: $id)
  }
`;

const BANK_ACCOUNT_FIELDS = gql`
  fragment BankAccountFields on BankAccount {
    id
    plaidAccountId
    name
    officialName
    mask
    type
    subtype
    syncEnabled
    isCreditCard
  }
`;

const BANK_CONNECTION_FIELDS = gql`
  ${BANK_ACCOUNT_FIELDS}
  fragment BankConnectionFields on BankConnection {
    id
    institutionId
    institutionName
    status
    lastSyncedAt
    lastError
    accounts {
      ...BankAccountFields
    }
  }
`;

export const BANK_CONNECTIONS_QUERY = gql`
  ${BANK_CONNECTION_FIELDS}
  query BankConnections {
    bankConnections {
      ...BankConnectionFields
    }
  }
`;

export const CREATE_PLAID_LINK_TOKEN_MUTATION = gql`
  mutation CreatePlaidLinkToken {
    createPlaidLinkToken {
      linkToken
      expiration
    }
  }
`;

export const COMPLETE_PLAID_LINK_MUTATION = gql`
  ${BANK_CONNECTION_FIELDS}
  mutation CompletePlaidLink($publicToken: String!) {
    completePlaidLink(publicToken: $publicToken) {
      ...BankConnectionFields
    }
  }
`;

export const UPDATE_BANK_ACCOUNT_SYNC_MUTATION = gql`
  ${BANK_CONNECTION_FIELDS}
  mutation UpdateBankAccountSync($connectionId: ID!, $enabledAccountIds: [ID!]!) {
    updateBankAccountSync(connectionId: $connectionId, enabledAccountIds: $enabledAccountIds) {
      ...BankConnectionFields
    }
  }
`;

export const DISCONNECT_BANK_CONNECTION_MUTATION = gql`
  mutation DisconnectBankConnection($connectionId: ID!) {
    disconnectBankConnection(connectionId: $connectionId)
  }
`;

export const SYNC_BANK_CONNECTION_NOW_MUTATION = gql`
  ${BANK_CONNECTION_FIELDS}
  mutation SyncBankConnectionNow($connectionId: ID!) {
    syncBankConnectionNow(connectionId: $connectionId) {
      ...BankConnectionFields
    }
  }
`;
