export const folderTypeDefs = /* GraphQL */ `
  enum FolderNamespace {
    MEALS
    RECEIPTS
  }

  enum FolderColor {
    BLUSH
    SKY
    LAVENDER
    LEMON
    PEACH
    SAGE
  }

  type Folder {
    id: ID!
    namespace: FolderNamespace!
    name: String!
    color: FolderColor!
    parentId: ID
    itemCount: Int!
    childFolderCount: Int!
  }

  input CreateFolderInput {
    namespace: FolderNamespace!
    name: String!
    color: FolderColor!
    parentId: ID
  }

  input UpdateFolderInput {
    name: String
    color: FolderColor
  }

  extend type Mutation {
    createFolder(input: CreateFolderInput!): Folder!
    updateFolder(id: ID!, input: UpdateFolderInput!): Folder!
    deleteFolder(id: ID!): Boolean!
  }
`;
