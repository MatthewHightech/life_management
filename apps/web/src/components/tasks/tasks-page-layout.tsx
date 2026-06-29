"use client";

import { ModulePageLayout } from "@/components/shell/module-page-layout";
import { TasksViewToggle } from "@/components/tasks/tasks-view-toggle";

type TasksPageLayoutProps = {
  children: React.ReactNode;
};

export function TasksPageLayout({ children }: TasksPageLayoutProps) {
  return (
    <ModulePageLayout title="Tasks" headerExtra={<TasksViewToggle />}>
      {children}
    </ModulePageLayout>
  );
}
