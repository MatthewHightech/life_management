import { gql } from "@apollo/client";
import { FOLDER_FIELDS } from "./folders";

const GEAR_ITEM_FIELDS = gql`
  fragment GearItemFields on GearItem {
    id
    name
    description
    size
    careInstructions
    condition
    folderId
    hasPhoto
    isOnLoan
    createdAt
    updatedAt
  }
`;

const GEAR_VARIANT_FIELDS = gql`
  fragment GearVariantFields on GearVariant {
    id
    classId
    name
    size
    condition
    hasPhoto
    isOnLoan
    createdAt
    updatedAt
  }
`;

const GEAR_CLASS_FIELDS = gql`
  fragment GearClassFields on GearItemClass {
    id
    name
    description
    careInstructions
    folderId
    createdAt
    updatedAt
    variants {
      ...GearVariantFields
    }
  }
  ${GEAR_VARIANT_FIELDS}
`;

const GEAR_LOAN_ITEM_FIELDS = gql`
  fragment GearLoanItemFields on GearLoanItem {
    id
    displayName
    hasPhoto
    gearItem {
      id
      name
      hasPhoto
    }
    gearVariant {
      id
      name
      hasPhoto
    }
  }
`;

const GEAR_LOAN_FIELDS = gql`
  fragment GearLoanFields on GearLoan {
    id
    borrowerName
    borrowerEmail
    lentAt
    returnBy
    returnedAt
    isOverdue
    createdAt
    updatedAt
    items {
      ...GearLoanItemFields
    }
  }
  ${GEAR_LOAN_ITEM_FIELDS}
`;

export const GEAR_LIBRARY_QUERY = gql`
  ${FOLDER_FIELDS}
  ${GEAR_ITEM_FIELDS}
  ${GEAR_CLASS_FIELDS}
  query GearLibrary {
    gearLibrary {
      folders {
        ...FolderFields
      }
      items {
        ...GearItemFields
      }
      classes {
        ...GearClassFields
      }
    }
  }
`;

export const GEAR_LENDING_QUERY = gql`
  ${GEAR_LOAN_FIELDS}
  query GearLending {
    gearLending {
      activeLoans {
        ...GearLoanFields
      }
      loanHistory {
        ...GearLoanFields
      }
    }
  }
`;

export const CREATE_GEAR_ITEM_MUTATION = gql`
  ${GEAR_ITEM_FIELDS}
  mutation CreateGearItem($input: CreateGearItemInput!) {
    createGearItem(input: $input) {
      ...GearItemFields
    }
  }
`;

export const UPDATE_GEAR_ITEM_MUTATION = gql`
  ${GEAR_ITEM_FIELDS}
  mutation UpdateGearItem($id: ID!, $input: UpdateGearItemInput!) {
    updateGearItem(id: $id, input: $input) {
      ...GearItemFields
    }
  }
`;

export const DELETE_GEAR_ITEM_MUTATION = gql`
  mutation DeleteGearItem($id: ID!) {
    deleteGearItem(id: $id)
  }
`;

export const MOVE_GEAR_ITEM_TO_FOLDER_MUTATION = gql`
  ${GEAR_ITEM_FIELDS}
  mutation MoveGearItemToFolder($gearItemId: ID!, $folderId: ID) {
    moveGearItemToFolder(gearItemId: $gearItemId, folderId: $folderId) {
      ...GearItemFields
    }
  }
`;

export const CREATE_GEAR_CLASS_MUTATION = gql`
  ${GEAR_CLASS_FIELDS}
  mutation CreateGearItemClass($input: CreateGearItemClassInput!) {
    createGearItemClass(input: $input) {
      ...GearClassFields
    }
  }
`;

export const UPDATE_GEAR_CLASS_MUTATION = gql`
  ${GEAR_CLASS_FIELDS}
  mutation UpdateGearItemClass($id: ID!, $input: UpdateGearItemClassInput!) {
    updateGearItemClass(id: $id, input: $input) {
      ...GearClassFields
    }
  }
`;

export const DELETE_GEAR_CLASS_MUTATION = gql`
  mutation DeleteGearItemClass($id: ID!) {
    deleteGearItemClass(id: $id)
  }
`;

export const MOVE_GEAR_CLASS_TO_FOLDER_MUTATION = gql`
  ${GEAR_CLASS_FIELDS}
  mutation MoveGearItemClassToFolder($classId: ID!, $folderId: ID) {
    moveGearItemClassToFolder(classId: $classId, folderId: $folderId) {
      ...GearClassFields
    }
  }
`;

export const CREATE_GEAR_VARIANT_MUTATION = gql`
  ${GEAR_VARIANT_FIELDS}
  mutation CreateGearVariant($input: CreateGearVariantInput!) {
    createGearVariant(input: $input) {
      ...GearVariantFields
    }
  }
`;

export const UPDATE_GEAR_VARIANT_MUTATION = gql`
  ${GEAR_VARIANT_FIELDS}
  mutation UpdateGearVariant($id: ID!, $input: UpdateGearVariantInput!) {
    updateGearVariant(id: $id, input: $input) {
      ...GearVariantFields
    }
  }
`;

export const DELETE_GEAR_VARIANT_MUTATION = gql`
  mutation DeleteGearVariant($id: ID!) {
    deleteGearVariant(id: $id)
  }
`;

export const CREATE_GEAR_LOAN_MUTATION = gql`
  ${GEAR_LOAN_FIELDS}
  mutation CreateGearLoan($input: CreateGearLoanInput!) {
    createGearLoan(input: $input) {
      ...GearLoanFields
    }
  }
`;

export const MARK_GEAR_LOAN_RETURNED_MUTATION = gql`
  ${GEAR_LOAN_FIELDS}
  mutation MarkGearLoanReturned($id: ID!) {
    markGearLoanReturned(id: $id) {
      ...GearLoanFields
    }
  }
`;

export const CLEAR_GEAR_LOAN_HISTORY_MUTATION = gql`
  mutation ClearGearLoanHistory {
    clearGearLoanHistory
  }
`;
