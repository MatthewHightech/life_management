import { Suspense } from "react";
import { ModuleRouteShell } from "@/components/shell/module-route-shell";
import { TaskBoardsProvider } from "@/components/tasks/task-boards-context";

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleRouteShell>
      <Suspense fallback={null}>
        <TaskBoardsProvider>{children}</TaskBoardsProvider>
      </Suspense>
    </ModuleRouteShell>
  );
}
