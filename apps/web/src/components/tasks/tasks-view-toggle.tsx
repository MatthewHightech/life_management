"use client";

import { usePathname } from "next/navigation";
import { Calendar, LayoutGrid, List } from "lucide-react";
import { useTaskBoards } from "@/components/tasks/task-boards-context";
import { ViewToggle, type ViewToggleItem } from "@/components/ui/view-toggle";

type TasksView = "kanban" | "list" | "calendar";

function activeTasksView(pathname: string): TasksView {
  if (pathname === "/tasks/list") {
    return "list";
  }
  if (pathname === "/tasks/calendar") {
    return "calendar";
  }
  return "kanban";
}

export function TasksViewToggle() {
  const pathname = usePathname();
  const { activeBoardId } = useTaskBoards();
  const query = activeBoardId ? `?project=${encodeURIComponent(activeBoardId)}` : "";

  const items: ViewToggleItem<TasksView>[] = [
    { value: "kanban", label: "Kanban", icon: LayoutGrid, href: `/tasks${query}` },
    { value: "list", label: "List", icon: List, href: `/tasks/list${query}` },
    { value: "calendar", label: "Calendar", icon: Calendar, href: `/tasks/calendar${query}` },
  ];

  return <ViewToggle items={items} value={activeTasksView(pathname)} />;
}
