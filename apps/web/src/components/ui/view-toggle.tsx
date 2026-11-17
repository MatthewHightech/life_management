"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type ViewToggleItem<T extends string = string> = {
  value: T;
  label: string;
  href: string;
  icon?: LucideIcon;
};

type ViewToggleProps<T extends string> = {
  items: readonly ViewToggleItem<T>[];
  value: T;
};

export function ViewToggle<T extends string>({ items, value }: ViewToggleProps<T>) {
  return (
    <div className="flex rounded-lg border border-border-subtle bg-background p-1">
      {items.map((item) => {
        const active = item.value === value;
        const Icon = item.icon;

        return (
          <Link
            key={item.value}
            href={item.href}
            className={cn(
              "cursor-pointer rounded-md px-3 py-1.5 text-sm",
              Icon && "inline-flex items-center gap-1.5",
              active ? "bg-surface text-primary shadow-sm" : "text-text-muted",
            )}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
