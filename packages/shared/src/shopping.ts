export const SHOPPING_URGENCIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type ShoppingUrgency = (typeof SHOPPING_URGENCIES)[number];

export const SHOPPING_URGENCY_LABELS: Record<ShoppingUrgency, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const SHOPPING_URGENCY_COLORS: Record<ShoppingUrgency, { background: string; text: string }> = {
  LOW: { background: "#3d9b5c", text: "#ffffff" },
  MEDIUM: { background: "#d4a017", text: "#ffffff" },
  HIGH: { background: "#ba1a1a", text: "#ffffff" },
};
