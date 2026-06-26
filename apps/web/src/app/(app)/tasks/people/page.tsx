import { AppShell } from "@/components/app-shell";
import { TaskList } from "@/components/task-list";

export default function PeopleTasksPage() {
  return (
    <AppShell title="By person" subtitle="Tasks grouped by assignee">
      <TaskList view="BY_PERSON" groupBy="assignee" />
    </AppShell>
  );
}
