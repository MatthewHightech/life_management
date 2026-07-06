import type { FolderNamespace } from "@life/shared";
import { GEAR_PAGE_REFETCH } from "@/lib/gear-queries";
import { MEAL_PLAN_REFETCH } from "@/lib/meal-plan-queries";
import { RECEIPT_LIBRARY_REFETCH } from "@/lib/receipt-queries";

export function folderRefetchQueries(namespace: FolderNamespace) {
  if (namespace === "MEALS") {
    return [...MEAL_PLAN_REFETCH];
  }
  if (namespace === "GEAR") {
    return [...GEAR_PAGE_REFETCH];
  }
  return [...RECEIPT_LIBRARY_REFETCH];
}
