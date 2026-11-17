export const SHOPPING_URGENCIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type ShoppingUrgency = (typeof SHOPPING_URGENCIES)[number];

export const SHOPPING_URGENCY_LABELS: Record<ShoppingUrgency, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};
