"use client";

import { TaskBoardBar } from "@/components/tasks/task-board-bar";
import { TaskBoardDnd } from "@/components/tasks/task-board-dnd";
import { TaskCommentsProvider } from "@/components/tasks/task-comments-context";
import { TaskCommentsSidebar } from "@/components/tasks/task-comments-sidebar";
import { TasksViewToggle } from "@/components/tasks/tasks-view-toggle";
import { ModulePageLayout } from "@/components/shell/module-page-layout";

const TASKS_CONTENT_INSET = "mx-auto w-full max-w-[1400px] px-3 sm:px-4";

type TasksPageLayoutProps = {
  children: React.ReactNode;
};

export function TasksPageLayout({ children }: TasksPageLayoutProps) {
  return (
    <TaskCommentsProvider>
      <ModulePageLayout
        title="Tasks"
        headerExtra={<TasksViewToggle />}
        contentInsetClassName={TASKS_CONTENT_INSET}
      >
        <TaskBoardDnd>
          <div className="-mt-2 mb-4 border-b border-border-subtle pb-2">
            <TaskBoardBar />
          </div>
          {children}
        </TaskBoardDnd>
      </ModulePageLayout>
      <TaskCommentsSidebar />
    </TaskCommentsProvider>
  );
}
