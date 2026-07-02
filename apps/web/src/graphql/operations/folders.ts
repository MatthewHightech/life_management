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
