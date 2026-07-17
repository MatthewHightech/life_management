export const shoppingTypeDefs = `#graphql
  type ShoppingItem {
    id: ID!
    name: String!
    budgetCents: Int
    urgency: TaskPriority!
    purchasedAt: String
    createdBy: User!
    commentCount: Int!
    unreadCommentCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type ShoppingItemComment {
    id: ID!
    body: String!
    author: User!
    createdAt: String!
    canDelete: Boolean!
  }

  input CreateShoppingItemInput {
    name: String!
    budgetCents: Int
    urgency: TaskPriority
  }

  input UpdateShoppingItemInput {
    name: String
    budgetCents: Int
    clearBudget: Boolean
    urgency: TaskPriority
  }

  extend type Query {
    shoppingItems: [ShoppingItem!]!
    shoppingItemComments(shoppingItemId: ID!): [ShoppingItemComment!]!
  }

  extend type Mutation {
    createShoppingItem(input: CreateShoppingItemInput!): ShoppingItem!
    updateShoppingItem(id: ID!, input: UpdateShoppingItemInput!): ShoppingItem!
    setShoppingItemPurchased(id: ID!, purchased: Boolean!): ShoppingItem!
    deleteShoppingItem(id: ID!): Boolean!
    clearPurchasedShoppingItems: Int!
    addShoppingItemComment(shoppingItemId: ID!, body: String!): ShoppingItemComment!
    deleteShoppingItemComment(id: ID!): Boolean!
    markShoppingItemCommentsRead(shoppingItemId: ID!): Boolean!
  }
`;
