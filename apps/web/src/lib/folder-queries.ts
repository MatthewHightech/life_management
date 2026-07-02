import type { FolderNamespace } from "@life/shared";
import { MEAL_PLAN_REFETCH } from "@/lib/meal-plan-queries";
import { RECEIPT_LIBRARY_REFETCH } from "@/lib/receipt-queries";

export function folderRefetchQueries(namespace: FolderNamespace) {
  return namespace === "MEALS" ? [...MEAL_PLAN_REFETCH] : [...RECEIPT_LIBRARY_REFETCH];
}
