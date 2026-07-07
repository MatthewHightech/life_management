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

export const BUDGET_MONTH_QUERY = gql`
  ${BUDGET_SECTION_FIELDS}
  query BudgetMonth {
    budgetMonth {
      year
      month
      title
      annualTitle
      monthlySections {
        ...BudgetSectionFields
      }
      annualSections {
        ...BudgetSectionFields
      }
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
