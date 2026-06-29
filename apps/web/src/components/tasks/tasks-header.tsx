"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/cn";

export function TasksHeader() {
  const pathname = usePathname();
  const isList = pathname === "/tasks/list";

  return (
    <div className="border-b border-border-subtle bg-surface px-4 py-4 sm:px-6 shrink-0">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-text-main">Tasks</h1>
          <div className="flex rounded-lg border border-border-subtle bg-background p-1">
            <Link
              href="/tasks"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm",
                !isList ? "bg-surface text-primary shadow-sm" : "text-text-muted",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </Link>
            <Link
              href="/tasks/list"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm",
                isList ? "bg-surface text-primary shadow-sm" : "text-text-muted",
              )}
            >
              <List className="h-4 w-4" />
              List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
