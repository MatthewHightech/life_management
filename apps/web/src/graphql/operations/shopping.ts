import { gql } from "@apollo/client";

const SHOPPING_ITEM_FIELDS = gql`
  fragment ShoppingItemFields on ShoppingItem {
    id
    name
    budgetCents
    urgency
    purchasedAt
    commentCount
    unreadCommentCount
    createdAt
    createdBy {
      id
      name
      email
      image
    }
  }
`;

const SHOPPING_ITEM_COMMENT_FIELDS = gql`
  fragment ShoppingItemCommentFields on ShoppingItemComment {
    id
    body
    createdAt
    canDelete
    author {
      id
      name
      email
      image
    }
  }
`;

export const SHOPPING_LIST_QUERY = gql`
  ${SHOPPING_ITEM_FIELDS}
  query ShoppingList {
    shoppingItems {
      ...ShoppingItemFields
    }
    me {
      id
      name
      email
      image
    }
  }
`;

export const CREATE_SHOPPING_ITEM_MUTATION = gql`
  ${SHOPPING_ITEM_FIELDS}
  mutation CreateShoppingItem($input: CreateShoppingItemInput!) {
    createShoppingItem(input: $input) {
      ...ShoppingItemFields
    }
  }
`;

export const UPDATE_SHOPPING_ITEM_MUTATION = gql`
  ${SHOPPING_ITEM_FIELDS}
  mutation UpdateShoppingItem($id: ID!, $input: UpdateShoppingItemInput!) {
    updateShoppingItem(id: $id, input: $input) {
      ...ShoppingItemFields
    }
  }
`;

export const SET_SHOPPING_ITEM_PURCHASED_MUTATION = gql`
  ${SHOPPING_ITEM_FIELDS}
  mutation SetShoppingItemPurchased($id: ID!, $purchased: Boolean!) {
    setShoppingItemPurchased(id: $id, purchased: $purchased) {
      ...ShoppingItemFields
    }
  }
`;

export const DELETE_SHOPPING_ITEM_MUTATION = gql`
  mutation DeleteShoppingItem($id: ID!) {
    deleteShoppingItem(id: $id)
  }
`;

export const CLEAR_PURCHASED_SHOPPING_ITEMS_MUTATION = gql`
  mutation ClearPurchasedShoppingItems {
    clearPurchasedShoppingItems
  }
`;

export const SHOPPING_ITEM_COMMENTS_QUERY = gql`
  ${SHOPPING_ITEM_COMMENT_FIELDS}
  query ShoppingItemComments($shoppingItemId: ID!) {
    shoppingItemComments(shoppingItemId: $shoppingItemId) {
      ...ShoppingItemCommentFields
    }
  }
`;

export const ADD_SHOPPING_ITEM_COMMENT_MUTATION = gql`
  ${SHOPPING_ITEM_COMMENT_FIELDS}
  mutation AddShoppingItemComment($shoppingItemId: ID!, $body: String!) {
    addShoppingItemComment(shoppingItemId: $shoppingItemId, body: $body) {
      ...ShoppingItemCommentFields
    }
  }
`;

export const DELETE_SHOPPING_ITEM_COMMENT_MUTATION = gql`
  mutation DeleteShoppingItemComment($id: ID!) {
    deleteShoppingItemComment(id: $id)
  }
`;

export const MARK_SHOPPING_ITEM_COMMENTS_READ_MUTATION = gql`
  mutation MarkShoppingItemCommentsRead($shoppingItemId: ID!) {
    markShoppingItemCommentsRead(shoppingItemId: $shoppingItemId)
  }
`;
