"use client";

import { usePathname } from "next/navigation";
import { BarChart3, ShoppingCart, Wallet } from "lucide-react";
import { ViewToggle, type ViewToggleItem } from "@/components/ui/view-toggle";

type FinanceView = "budget" | "reports" | "shopping";

const items: ViewToggleItem<FinanceView>[] = [
  { value: "budget", label: "Budget", icon: Wallet, href: "/finance/budget" },
  { value: "reports", label: "Monthly Reports", icon: BarChart3, href: "/finance/reports" },
  { value: "shopping", label: "Shopping List", icon: ShoppingCart, href: "/finance/shopping-list" },
];

function activeFinanceView(pathname: string): FinanceView {
  const match = items.find(
    (item) => item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );
  return match?.value ?? "budget";
}

export function FinanceViewToggle() {
  const pathname = usePathname();
  return <ViewToggle items={items} value={activeFinanceView(pathname)} />;
}
