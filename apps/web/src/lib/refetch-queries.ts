import type { DocumentNode } from "@apollo/client";
import type { FolderNamespace } from "@life/shared";
import {
  BankConnectionsDocument,
  BudgetLineAllocationsDocument,
  BudgetMonthDocument,
  GearLendingDocument,
  GearLibraryDocument,
  MealPlanDocument,
  ReceiptLibraryDocument,
} from "@/graphql";

export const BUDGET_PAGE_REFETCH = [BudgetMonthDocument, BankConnectionsDocument] as const;
export const BUDGET_LINE_ALLOCATIONS_REFETCH = [
  BudgetLineAllocationsDocument,
  BudgetMonthDocument,
  BankConnectionsDocument,
] as const;
export const BANK_CONNECTIONS_REFETCH = [BankConnectionsDocument, BudgetMonthDocument] as const;
export const GEAR_PAGE_REFETCH = [GearLibraryDocument, GearLendingDocument] as const;
export const MEAL_PLAN_REFETCH = [MealPlanDocument] as const;
export const RECEIPT_LIBRARY_REFETCH = [ReceiptLibraryDocument] as const;

const FOLDER_REFETCH: Record<FolderNamespace, readonly DocumentNode[]> = {
  MEALS: MEAL_PLAN_REFETCH,
  GEAR: GEAR_PAGE_REFETCH,
  RECEIPTS: RECEIPT_LIBRARY_REFETCH,
};

export function folderRefetchQueries(namespace: FolderNamespace) {
  return [...FOLDER_REFETCH[namespace]];
}
