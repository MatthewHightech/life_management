import { gql } from "@apollo/client";
import { FOLDER_FIELDS } from "./folders";

const RECEIPT_FIELDS = gql`
  fragment ReceiptFields on Receipt {
    id
    fileName
    mimeType
    byteSize
    folderId
    createdAt
    updatedAt
  }
`;

export const RECEIPT_LIBRARY_QUERY = gql`
  ${FOLDER_FIELDS}
  ${RECEIPT_FIELDS}
  query ReceiptLibrary {
    receiptLibrary {
      folders {
        ...FolderFields
      }
      receipts {
        ...ReceiptFields
      }
    }
  }
`;

export const RENAME_RECEIPT_MUTATION = gql`
  ${RECEIPT_FIELDS}
  mutation RenameReceipt($id: ID!, $fileName: String!) {
    renameReceipt(id: $id, fileName: $fileName) {
      ...ReceiptFields
    }
  }
`;

export const DELETE_RECEIPT_MUTATION = gql`
  mutation DeleteReceipt($id: ID!) {
    deleteReceipt(id: $id)
  }
`;

export const MOVE_RECEIPT_TO_FOLDER_MUTATION = gql`
  ${RECEIPT_FIELDS}
  mutation MoveReceiptToFolder($receiptId: ID!, $folderId: ID) {
    moveReceiptToFolder(receiptId: $receiptId, folderId: $folderId) {
      ...ReceiptFields
    }
  }
`;
