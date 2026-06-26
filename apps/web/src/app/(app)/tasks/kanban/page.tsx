import { AppShell } from "@/components/app-shell";
import { TaskList } from "@/components/task-list";

export default function KanbanTasksPage() {
  return (
    <AppShell title="Kanban" subtitle="Tasks by status">
      <TaskList view="KANBAN" groupBy="status" />
    </AppShell>
  );
}
