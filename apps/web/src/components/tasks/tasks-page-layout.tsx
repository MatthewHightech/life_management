"use client";

import { CommentsProvider } from "@/components/comments/comments-context";
import { TaskBoardBar } from "@/components/tasks/task-board-bar";
import { TaskBoardDnd } from "@/components/tasks/task-board-dnd";
import { TaskCommentsSidebar } from "@/components/tasks/task-comments-sidebar";
import { TasksViewToggle } from "@/components/tasks/tasks-view-toggle";
import { ModulePageLayout } from "@/components/shell/module-page-layout";

const TASKS_CONTENT_INSET = "mx-auto w-full max-w-[1400px] px-3 sm:px-4";

type TasksPageLayoutProps = {
  waiting: boolean;
  error?: { message: string };
  loadingLabel?: string;
  children: React.ReactNode;
};

export function TasksPageLayout({ waiting, error, loadingLabel = "Loading tasks…", children }: TasksPageLayoutProps) {
  return (
    <CommentsProvider>
      <ModulePageLayout
        title="Tasks"
        headerExtra={<TasksViewToggle />}
        contentInsetClassName={TASKS_CONTENT_INSET}
      >
        <TaskBoardDnd>
          <div className="-mt-2 mb-4 border-b border-border-subtle pb-2">
            <TaskBoardBar />
          </div>
          {waiting && <p className="text-sm text-text-muted">{loadingLabel}</p>}
          {error && <p className="text-sm text-error">Could not load tasks: {error.message}</p>}
          {!waiting && !error && children}
        </TaskBoardDnd>
      </ModulePageLayout>
      <TaskCommentsSidebar />
    </CommentsProvider>
  );
}
