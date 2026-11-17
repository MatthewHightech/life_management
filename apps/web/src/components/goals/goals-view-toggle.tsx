"use client";

import { usePathname } from "next/navigation";
import { ViewToggle, type ViewToggleItem } from "@/components/ui/view-toggle";

type GoalsView = "current" | "past";

const items: ViewToggleItem<GoalsView>[] = [
  { value: "current", label: "Current Goals", href: "/goals/current" },
  { value: "past", label: "Past Goals", href: "/goals/past" },
];

function activeGoalsView(pathname: string): GoalsView {
  const match = items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.value ?? "current";
}

export function GoalsViewToggle() {
  const pathname = usePathname();
  return <ViewToggle items={items} value={activeGoalsView(pathname)} />;
}
