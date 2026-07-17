"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const FINANCE_VIEWS = [
  { href: "/finance/budget", label: "Budget" },
  { href: "/finance/reports", label: "Monthly Reports" },
  { href: "/finance/shopping-list", label: "Shopping List" },
] as const;

export function FinanceViewToggle() {
  const pathname = usePathname();

  return (
    <div className="flex rounded-lg border border-border-subtle bg-background p-1">
      {FINANCE_VIEWS.map((view) => {
        const active = pathname === view.href || pathname.startsWith(`${view.href}/`);

        return (
          <Link
            key={view.href}
            href={view.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm",
              active ? "bg-surface text-primary shadow-sm" : "text-text-muted",
            )}
          >
            {view.label}
          </Link>
        );
      })}
    </div>
  );
}
