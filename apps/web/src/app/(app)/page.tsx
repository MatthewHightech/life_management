import { AppShell } from "@/components/app-shell";
import { TaskList } from "@/components/task-list";

export default function TodayPage() {
  return (
    <AppShell title="Today" subtitle="Tasks due today and inbox items">
      <TaskList view="TODAY" />
    </AppShell>
  );
}
