"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { useTaskBoards } from "@/components/tasks/task-boards-context";
import { cn } from "@/lib/cn";

export function TasksViewToggle() {
  const pathname = usePathname();
  const { activeBoardId } = useTaskBoards();
  const isList = pathname === "/tasks/list";
  const query = activeBoardId ? `?project=${encodeURIComponent(activeBoardId)}` : "";

  return (
    <div className="flex rounded-lg border border-border-subtle bg-background p-1">
      <Link
        href={`/tasks${query}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm",
          !isList ? "bg-surface text-primary shadow-sm" : "text-text-muted",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Kanban
      </Link>
      <Link
        href={`/tasks/list${query}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm",
          isList ? "bg-surface text-primary shadow-sm" : "text-text-muted",
        )}
      >
        <List className="h-4 w-4" />
        List
      </Link>
    </div>
  );
}
