export const mealTypeDefs = /* GraphQL */ `
  enum WeekDay {
    SUNDAY
    MONDAY
    TUESDAY
    WEDNESDAY
    THURSDAY
    FRIDAY
    SATURDAY
  }

  enum MealSlot {
    BREAKFAST
    LUNCH
    DINNER
  }

  type RecipeIngredient {
    id: ID!
    name: String!
    quantity: String
    unit: String
    sortOrder: Int!
  }

  type Recipe {
    id: ID!
    name: String!
    instructions: String
    servings: Int
    folderId: ID
    ingredients: [RecipeIngredient!]!
    createdAt: String!
    updatedAt: String!
  }

  type MealPlanSlot {
    id: ID!
    day: WeekDay!
    slot: MealSlot!
    recipe: Recipe
  }

  type GroceryListItem {
    id: ID!
    name: String!
    quantityLabel: String!
    isBought: Boolean!
    isManual: Boolean!
  }

  type MealPlan {
    weekStart: String!
    recipes: [Recipe!]!
    folders: [Folder!]!
    slots: [MealPlanSlot!]!
    groceryItems: [GroceryListItem!]!
  }

  input RecipeIngredientInput {
    name: String!
    quantity: String
    unit: String
  }

  input CreateRecipeInput {
    name: String!
    instructions: String
    servings: Int
    folderId: ID
    ingredients: [RecipeIngredientInput!]!
  }

  input UpdateRecipeInput {
    name: String
    instructions: String
    servings: Int
    ingredients: [RecipeIngredientInput!]
  }

  input AddGroceryItemInput {
    name: String!
    quantityLabel: String
  }

  input UpdateGroceryItemInput {
    name: String
    quantityLabel: String
    isBought: Boolean
  }

  extend type Query {
    mealPlan: MealPlan!
  }

  extend type Mutation {
    createRecipe(input: CreateRecipeInput!): Recipe!
    updateRecipe(id: ID!, input: UpdateRecipeInput!): Recipe!
    deleteRecipe(id: ID!): Boolean!
    moveRecipeToFolder(recipeId: ID!, folderId: ID): Recipe!
    assignMealPlanSlot(day: WeekDay!, slot: MealSlot!, recipeId: ID!): MealPlanSlot!
    clearMealPlanSlot(day: WeekDay!, slot: MealSlot!): Boolean!
    addGroceryItem(input: AddGroceryItemInput!): GroceryListItem!
    updateGroceryItem(id: ID!, input: UpdateGroceryItemInput!): GroceryListItem!
    deleteGroceryItem(id: ID!): Boolean!
    removeBoughtGroceryItems: Int!
  }
`;
