export const receiptTypeDefs = /* GraphQL */ `
  type Receipt {
    id: ID!
    fileName: String!
    mimeType: String!
    byteSize: Int!
    folderId: ID
    createdAt: String!
    updatedAt: String!
  }

  type ReceiptLibrary {
    folders: [Folder!]!
    receipts: [Receipt!]!
  }

  extend type Query {
    receiptLibrary: ReceiptLibrary!
  }

  extend type Mutation {
    renameReceipt(id: ID!, fileName: String!): Receipt!
    deleteReceipt(id: ID!): Boolean!
    moveReceiptToFolder(receiptId: ID!, folderId: ID): Receipt!
  }
`;
