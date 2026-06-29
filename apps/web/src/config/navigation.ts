import type { LucideIcon } from "lucide-react";
import { Calendar, CheckSquare, UtensilsCrossed, Wallet } from "lucide-react";

export type ModuleNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
};

export const moduleNav: ModuleNavItem[] = [
  { id: "tasks", label: "Tasks", href: "/tasks", icon: CheckSquare, enabled: true },
  { id: "finance", label: "Finance", href: "/finance", icon: Wallet, enabled: true },
  { id: "calendar", label: "Calendar", href: "/calendar", icon: Calendar, enabled: false },
  { id: "meals", label: "Meal Planning", href: "/meals", icon: UtensilsCrossed, enabled: true },
];
