"use client";

import { TasksHeader } from "@/components/tasks/tasks-header";

type TasksPageLayoutProps = {
  onNewTask: () => void;
  children: React.ReactNode;
};

export function TasksPageLayout({ onNewTask, children }: TasksPageLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <TasksHeader onNewTask={onNewTask} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
