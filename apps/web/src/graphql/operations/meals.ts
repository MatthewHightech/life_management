import { gql } from "@apollo/client";

const RECIPE_FIELDS = gql`
  fragment RecipeFields on Recipe {
    id
    name
    instructions
    servings
    ingredients {
      id
      name
      quantity
      unit
      sortOrder
    }
    createdAt
    updatedAt
  }
`;

const MEAL_PLAN_SLOT_FIELDS = gql`
  fragment MealPlanSlotFields on MealPlanSlot {
    id
    day
    slot
    recipe {
      ...RecipeFields
    }
  }
  ${RECIPE_FIELDS}
`;

const GROCERY_ITEM_FIELDS = gql`
  fragment GroceryItemFields on GroceryListItem {
    id
    name
    quantityLabel
    isBought
    isManual
  }
`;

export const MEAL_PLAN_QUERY = gql`
  ${RECIPE_FIELDS}
  ${MEAL_PLAN_SLOT_FIELDS}
  ${GROCERY_ITEM_FIELDS}
  query MealPlan {
    mealPlan {
      weekStart
      recipes {
        ...RecipeFields
      }
      slots {
        ...MealPlanSlotFields
      }
      groceryItems {
        ...GroceryItemFields
      }
    }
  }
`;

export const CREATE_RECIPE_MUTATION = gql`
  ${RECIPE_FIELDS}
  mutation CreateRecipe($input: CreateRecipeInput!) {
    createRecipe(input: $input) {
      ...RecipeFields
    }
  }
`;

export const UPDATE_RECIPE_MUTATION = gql`
  ${RECIPE_FIELDS}
  mutation UpdateRecipe($id: ID!, $input: UpdateRecipeInput!) {
    updateRecipe(id: $id, input: $input) {
      ...RecipeFields
    }
  }
`;

export const DELETE_RECIPE_MUTATION = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id)
  }
`;

export const ASSIGN_MEAL_PLAN_SLOT_MUTATION = gql`
  ${MEAL_PLAN_SLOT_FIELDS}
  mutation AssignMealPlanSlot($day: WeekDay!, $slot: MealSlot!, $recipeId: ID!) {
    assignMealPlanSlot(day: $day, slot: $slot, recipeId: $recipeId) {
      ...MealPlanSlotFields
    }
  }
`;

export const CLEAR_MEAL_PLAN_SLOT_MUTATION = gql`
  mutation ClearMealPlanSlot($day: WeekDay!, $slot: MealSlot!) {
    clearMealPlanSlot(day: $day, slot: $slot)
  }
`;

export const ADD_GROCERY_ITEM_MUTATION = gql`
  ${GROCERY_ITEM_FIELDS}
  mutation AddGroceryItem($input: AddGroceryItemInput!) {
    addGroceryItem(input: $input) {
      ...GroceryItemFields
    }
  }
`;

export const UPDATE_GROCERY_ITEM_MUTATION = gql`
  ${GROCERY_ITEM_FIELDS}
  mutation UpdateGroceryItem($id: ID!, $input: UpdateGroceryItemInput!) {
    updateGroceryItem(id: $id, input: $input) {
      ...GroceryItemFields
    }
  }
`;

export const DELETE_GROCERY_ITEM_MUTATION = gql`
  mutation DeleteGroceryItem($id: ID!) {
    deleteGroceryItem(id: $id)
  }
`;

export const REMOVE_BOUGHT_GROCERY_ITEMS_MUTATION = gql`
  mutation RemoveBoughtGroceryItems {
    removeBoughtGroceryItems
  }
`;
