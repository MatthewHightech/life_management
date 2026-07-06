export const gearTypeDefs = /* GraphQL */ `
  enum GearCondition {
    LIKE_NEW
    GOOD
    FAIR
    RETIRED
  }

  type GearItem {
    id: ID!
    name: String!
    description: String
    size: String
    careInstructions: String
    condition: GearCondition!
    folderId: ID
    hasPhoto: Boolean!
    isOnLoan: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type GearVariant {
    id: ID!
    classId: ID!
    name: String!
    size: String
    condition: GearCondition!
    hasPhoto: Boolean!
    isOnLoan: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type GearItemClass {
    id: ID!
    name: String!
    description: String
    careInstructions: String
    folderId: ID
    variants: [GearVariant!]!
    createdAt: String!
    updatedAt: String!
  }

  type GearLoanItem {
    id: ID!
    gearItem: GearItem
    gearVariant: GearVariant
    displayName: String!
    hasPhoto: Boolean!
  }

  type GearLoan {
    id: ID!
    borrowerName: String!
    borrowerEmail: String!
    lentAt: String!
    returnBy: String!
    returnedAt: String
    isOverdue: Boolean!
    items: [GearLoanItem!]!
    createdAt: String!
    updatedAt: String!
  }

  type GearLibrary {
    folders: [Folder!]!
    items: [GearItem!]!
    classes: [GearItemClass!]!
  }

  type GearLending {
    activeLoans: [GearLoan!]!
    loanHistory: [GearLoan!]!
  }

  input CreateGearItemInput {
    name: String!
    description: String
    size: String
    careInstructions: String
    condition: GearCondition
    folderId: ID
  }

  input UpdateGearItemInput {
    name: String
    description: String
    size: String
    careInstructions: String
    condition: GearCondition
    folderId: ID
  }

  input CreateGearItemClassInput {
    name: String!
    description: String
    careInstructions: String
    folderId: ID
  }

  input UpdateGearItemClassInput {
    name: String
    description: String
    careInstructions: String
    folderId: ID
  }

  input CreateGearVariantInput {
    classId: ID!
    name: String!
    size: String
    condition: GearCondition
  }

  input UpdateGearVariantInput {
    name: String
    size: String
    condition: GearCondition
  }

  input CreateGearLoanInput {
    borrowerName: String!
    borrowerEmail: String!
    lentAt: String
    returnBy: String!
    gearItemIds: [ID!]!
    gearVariantIds: [ID!]!
  }

  extend type Query {
    gearLibrary: GearLibrary!
    gearLending: GearLending!
  }

  extend type Mutation {
    createGearItem(input: CreateGearItemInput!): GearItem!
    updateGearItem(id: ID!, input: UpdateGearItemInput!): GearItem!
    deleteGearItem(id: ID!): Boolean!
    moveGearItemToFolder(gearItemId: ID!, folderId: ID): GearItem!

    createGearItemClass(input: CreateGearItemClassInput!): GearItemClass!
    updateGearItemClass(id: ID!, input: UpdateGearItemClassInput!): GearItemClass!
    deleteGearItemClass(id: ID!): Boolean!
    moveGearItemClassToFolder(classId: ID!, folderId: ID): GearItemClass!

    createGearVariant(input: CreateGearVariantInput!): GearVariant!
    updateGearVariant(id: ID!, input: UpdateGearVariantInput!): GearVariant!
    deleteGearVariant(id: ID!): Boolean!

    createGearLoan(input: CreateGearLoanInput!): GearLoan!
    markGearLoanReturned(id: ID!): GearLoan!
    clearGearLoanHistory: Boolean!
  }
`;
