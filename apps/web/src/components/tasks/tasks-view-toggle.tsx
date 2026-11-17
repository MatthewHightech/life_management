"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, LayoutGrid, List, type LucideIcon } from "lucide-react";
import { useTaskBoards } from "@/components/tasks/task-boards-context";
import { cn } from "@/lib/cn";

const views: { href: string; label: string; icon: LucideIcon; match: (pathname: string) => boolean }[] = [
  { href: "/tasks", label: "Kanban", icon: LayoutGrid, match: (pathname) => pathname === "/tasks" },
  { href: "/tasks/list", label: "List", icon: List, match: (pathname) => pathname === "/tasks/list" },
  {
    href: "/tasks/calendar",
    label: "Calendar",
    icon: Calendar,
    match: (pathname) => pathname === "/tasks/calendar",
  },
];

export function TasksViewToggle() {
  const pathname = usePathname();
  const { activeBoardId } = useTaskBoards();
  const query = activeBoardId ? `?project=${encodeURIComponent(activeBoardId)}` : "";

  return (
    <div className="flex rounded-lg border border-border-subtle bg-background p-1">
      {views.map((view) => {
        const Icon = view.icon;
        const active = view.match(pathname);

        return (
          <Link
            key={view.href}
            href={`${view.href}${query}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm",
              active ? "bg-surface text-primary shadow-sm" : "text-text-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {view.label}
          </Link>
        );
      })}
    </div>
  );
}
