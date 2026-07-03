"use client";

import { TaskCommentsProvider } from "@/components/tasks/task-comments-context";
import { TaskCommentsSidebar } from "@/components/tasks/task-comments-sidebar";
import { TasksViewToggle } from "@/components/tasks/tasks-view-toggle";
import { ModulePageLayout } from "@/components/shell/module-page-layout";

type TasksPageLayoutProps = {
  children: React.ReactNode;
};

export function TasksPageLayout({ children }: TasksPageLayoutProps) {
  return (
    <TaskCommentsProvider>
      <ModulePageLayout title="Tasks" headerExtra={<TasksViewToggle />}>
        {children}
      </ModulePageLayout>
      <TaskCommentsSidebar />
    </TaskCommentsProvider>
  );
}
