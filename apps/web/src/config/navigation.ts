import type { LucideIcon } from "lucide-react";
import { CheckSquare, Package, Receipt, Target, UtensilsCrossed, Wallet } from "lucide-react";

export type ModuleNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
};

export const moduleNav: ModuleNavItem[] = [
  { id: "tasks", label: "Tasks", href: "/tasks", icon: CheckSquare, enabled: true },
  { id: "goals", label: "Goals", href: "/goals", icon: Target, enabled: true },
  { id: "finance", label: "Finance", href: "/finance", icon: Wallet, enabled: true },
  { id: "meals", label: "Meal Planning", href: "/meals", icon: UtensilsCrossed, enabled: true },
  { id: "receipts", label: "Receipts", href: "/receipts", icon: Receipt, enabled: true },
  { id: "gear", label: "Gear", href: "/gear", icon: Package, enabled: true },
];
