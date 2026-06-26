import { AppShell } from "@/components/app-shell";
import { TaskList } from "@/components/task-list";

export default function CalendarTasksPage() {
  return (
    <AppShell title="Calendar" subtitle="Tasks grouped by due date">
      <TaskList view="CALENDAR" groupBy="date" />
    </AppShell>
  );
}
