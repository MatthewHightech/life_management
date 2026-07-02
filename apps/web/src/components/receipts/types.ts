import type { ReceiptLibraryQuery } from "@/graphql";

export type ReceiptItem = ReceiptLibraryQuery["receiptLibrary"]["receipts"][number];
export type ReceiptFolder = ReceiptLibraryQuery["receiptLibrary"]["folders"][number];
