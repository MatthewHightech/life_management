"use client";

import { usePathname } from "next/navigation";
import { BookOpen, ShoppingCart } from "lucide-react";
import { ViewToggle, type ViewToggleItem } from "@/components/ui/view-toggle";

type MealsView = "recipes" | "grocery";

const items: ViewToggleItem<MealsView>[] = [
  { value: "recipes", label: "Recipes", icon: BookOpen, href: "/meals" },
  { value: "grocery", label: "Grocery List", icon: ShoppingCart, href: "/meals/grocery" },
];

function activeMealsView(pathname: string): MealsView {
  if (pathname === "/meals/grocery" || pathname.startsWith("/meals/grocery/")) {
    return "grocery";
  }
  return "recipes";
}

export function MealsViewToggle() {
  const pathname = usePathname();
  return <ViewToggle items={items} value={activeMealsView(pathname)} />;
}
