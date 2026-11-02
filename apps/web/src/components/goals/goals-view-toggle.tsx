"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const GOAL_VIEWS = [
  { href: "/goals/current", label: "Current Goals" },
  { href: "/goals/past", label: "Past Goals" },
] as const;

export function GoalsViewToggle() {
  const pathname = usePathname();

  return (
    <div className="flex rounded-lg border border-border-subtle bg-background p-1">
      {GOAL_VIEWS.map((view) => {
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
