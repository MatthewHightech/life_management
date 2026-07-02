import { gql } from "@apollo/client";

export const FOLDER_FIELDS = gql`
  fragment FolderFields on Folder {
    id
    namespace
    name
    color
    parentId
    itemCount
    childFolderCount
  }
`;

export const CREATE_FOLDER_MUTATION = gql`
  ${FOLDER_FIELDS}
  mutation CreateFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      ...FolderFields
    }
  }
`;

export const UPDATE_FOLDER_MUTATION = gql`
  ${FOLDER_FIELDS}
  mutation UpdateFolder($id: ID!, $input: UpdateFolderInput!) {
    updateFolder(id: $id, input: $input) {
      ...FolderFields
    }
  }
`;

export const DELETE_FOLDER_MUTATION = gql`
  mutation DeleteFolder($id: ID!) {
    deleteFolder(id: $id)
  }
`;
