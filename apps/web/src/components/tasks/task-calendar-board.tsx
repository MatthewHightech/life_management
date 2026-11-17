"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  buildMonthGrid,
  buildWeekDays,
  calendarDayKey,
  formatLongDate,
  formatMonthYear,
  formatWeekRange,
  isSameDay,
  isSameMonth,
  parseDueDate,
  startOfDay,
} from "@life/shared";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useComments } from "@/components/comments/comments-context";
import { TasksPageLayout } from "@/components/tasks/tasks-page-layout";
import type { BoardTask } from "@/components/tasks/task-table/types";
import { useBoardTasks } from "@/components/tasks/use-board-tasks";
import { CalendarNavButton } from "@/components/ui/calendar-picker";
import { ViewToggle, type ViewToggleItem } from "@/components/ui/view-toggle";
import { useTaskBoards } from "@/components/tasks/task-boards-context";
import { tasksBoardCalendarQuery } from "@/lib/task-board-queries";
import { kanbanColumnByStatus } from "@/lib/task-status";
import { cn } from "@/lib/cn";

type CalendarScope = "month" | "week" | "day";

type CalendarScopeConfig = {
  label: string;
  shift: (date: Date, amount: number) => Date;
  title: (date: Date) => string;
};

const CALENDAR_SCOPES: Record<CalendarScope, CalendarScopeConfig> = {
  month: { label: "Month", shift: addMonths, title: formatMonthYear },
  week: { label: "Week", shift: addWeeks, title: formatWeekRange },
  day: { label: "Day", shift: addDays, title: formatLongDate },
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function parseCalendarScope(value: string | null): CalendarScope {
  return value === "week" || value === "day" ? value : "month";
}

function calendarScopeHref(scope: CalendarScope, projectId: string | null) {
  const params = new URLSearchParams();
  if (scope !== "month") {
    params.set("scope", scope);
  }
  if (projectId) {
    params.set("project", projectId);
  }
  const query = params.toString();
  return query ? `/tasks/calendar?${query}` : "/tasks/calendar";
}

function tasksByDueDay(tasks: BoardTask[]) {
  const grouped = new Map<string, BoardTask[]>();

  for (const task of tasks) {
    if (!task.dueDate) {
      continue;
    }

    const key = calendarDayKey(parseDueDate(task.dueDate));
    const existing = grouped.get(key);
    if (existing) {
      existing.push(task);
    } else {
      grouped.set(key, [task]);
    }
  }

  return grouped;
}

function CalendarTaskChip({ task }: { task: BoardTask }) {
  const { openComments, activeTarget } = useComments();
  const done = task.status === "DONE";
  const overdue = task.isOverdue && !done;
  const isActive = activeTarget?.id === task.id;

  return (
    <button
      type="button"
      onClick={() => openComments({ id: task.id, title: task.title })}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs transition",
        "hover:bg-background",
        isActive && "bg-background",
        overdue && "bg-error-container/40 hover:bg-error-container/55",
        done && "opacity-60",
      )}
      title={task.title}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", kanbanColumnByStatus[task.status].dotClass)} />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-text-main",
          done && "line-through",
          overdue && "text-error",
        )}
      >
        {task.title}
      </span>
    </button>
  );
}

function WeekdayHeader({ days }: { days: Date[] }) {
  return (
    <div className="grid shrink-0 grid-cols-7 border-b border-border-subtle">
      {days.map((day) => (
        <div
          key={day.getDay()}
          className="border-r border-border-subtle px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted last:border-r-0"
        >
          {WEEKDAY_LABELS[day.getDay()]}
        </div>
      ))}
    </div>
  );
}

type CalendarViewProps = {
  focus: Date;
  today: Date;
  tasksByDay: Map<string, BoardTask[]>;
};

function CalendarDayCell({
  day,
  focus,
  today,
  tasksByDay,
  dimOutsideMonth,
}: CalendarViewProps & {
  day: Date;
  dimOutsideMonth: boolean;
}) {
  const tasks = tasksByDay.get(calendarDayKey(day)) ?? [];
  const isToday = isSameDay(day, today);
  const muted = dimOutsideMonth && !isSameMonth(day, focus);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col border-b border-r border-border-subtle p-1.5",
        muted && "bg-background/60",
      )}
    >
      <div className="mb-1 flex shrink-0 items-center justify-between px-0.5">
        <span
          className={cn(
            "inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-medium",
            muted && "text-text-muted/50",
            !muted && !isToday && "text-text-main",
            isToday && "bg-primary text-on-primary",
          )}
        >
          {day.getDate()}
        </span>
        {tasks.length > 0 ? (
          <span className="text-[10px] text-text-muted">{tasks.length}</span>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
        {tasks.map((task) => (
          <CalendarTaskChip key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function MonthView(props: CalendarViewProps) {
  const days = useMemo(() => buildMonthGrid(props.focus), [props.focus]);
  const weekCount = Math.ceil(days.length / 7);

  return (
    <>
      <WeekdayHeader days={days.slice(0, 7)} />

      <div
        className="grid min-h-0 flex-1 border-l border-t border-border-subtle"
        style={{ gridTemplateRows: `repeat(${weekCount}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: weekCount }, (_, weekIndex) => (
          <div key={weekIndex} className="grid min-h-0 grid-cols-7">
            {days.slice(weekIndex * 7, weekIndex * 7 + 7).map((day) => (
              <CalendarDayCell key={calendarDayKey(day)} day={day} dimOutsideMonth {...props} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function WeekView(props: CalendarViewProps) {
  const days = useMemo(() => buildWeekDays(props.focus), [props.focus]);

  return (
    <>
      <WeekdayHeader days={days} />

      <div className="grid min-h-0 flex-1 grid-cols-7 border-l border-t border-border-subtle">
        {days.map((day) => (
          <CalendarDayCell key={calendarDayKey(day)} day={day} dimOutsideMonth={false} {...props} />
        ))}
      </div>
    </>
  );
}

function DayView({ focus, today, tasksByDay }: CalendarViewProps) {
  const tasks = tasksByDay.get(calendarDayKey(focus)) ?? [];
  const isToday = isSameDay(focus, today);

  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-border-subtle p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-8 min-w-8 items-center justify-center rounded-full text-sm font-semibold",
            isToday ? "bg-primary text-on-primary" : "bg-background text-text-main",
          )}
        >
          {focus.getDate()}
        </span>
        <div>
          <p className="text-sm font-medium text-text-main">{formatLongDate(focus)}</p>
          <p className="text-xs text-text-muted">
            {tasks.length === 0
              ? "No tasks due"
              : `${tasks.length} task${tasks.length === 1 ? "" : "s"} due`}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="px-1.5 py-6 text-sm text-text-muted">Nothing due on this day.</p>
        ) : (
          tasks.map((task) => <CalendarTaskChip key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

const SCOPE_VIEWS: Record<CalendarScope, (props: CalendarViewProps) => React.ReactNode> = {
  month: MonthView,
  week: WeekView,
  day: DayView,
};

export function TaskCalendarBoard() {
  const { activeBoardId } = useTaskBoards();
  const { boardTasks, waiting, error } = useBoardTasks(tasksBoardCalendarQuery.variables);
  const searchParams = useSearchParams();
  const scope = parseCalendarScope(searchParams.get("scope"));
  const [focus, setFocus] = useState(() => startOfDay(new Date()));
  const today = useMemo(() => startOfDay(new Date()), []);

  const calendarScopeItems = useMemo<ViewToggleItem<CalendarScope>[]>(
    () =>
      (Object.keys(CALENDAR_SCOPES) as CalendarScope[]).map((item) => ({
        value: item,
        label: CALENDAR_SCOPES[item].label,
        href: calendarScopeHref(item, activeBoardId),
      })),
    [activeBoardId],
  );

  const tasksByDay = useMemo(() => tasksByDueDay(boardTasks), [boardTasks]);
  const ScopeView = SCOPE_VIEWS[scope];

  function shiftFocus(direction: -1 | 1) {
    setFocus((current) => startOfDay(CALENDAR_SCOPES[scope].shift(current, direction)));
  }

  return (
    <TasksPageLayout waiting={waiting} error={error}>
      <div className="flex h-[calc(100dvh-11.5rem)] min-h-[28rem] flex-col rounded-xl border border-border-subtle bg-surface">
        <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border-subtle px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2 justify-self-start">
            <CalendarNavButton label={`Previous ${scope}`} icon={ChevronLeft} onClick={() => shiftFocus(-1)} large />
            <ViewToggle items={calendarScopeItems} value={scope} />
          </div>

          <h2 className="justify-self-center text-center text-base font-semibold text-text-main">
            {CALENDAR_SCOPES[scope].title(focus)}
          </h2>

          <div className="flex items-center gap-2 justify-self-end">
            <button
              type="button"
              onClick={() => setFocus(today)}
              className="rounded-md px-2 py-1 text-xs font-medium text-text-muted transition hover:bg-background hover:text-text-main"
            >
              Today
            </button>
            <CalendarNavButton label={`Next ${scope}`} icon={ChevronRight} onClick={() => shiftFocus(1)} large />
          </div>
        </div>

        <ScopeView focus={focus} today={today} tasksByDay={tasksByDay} />
      </div>
    </TasksPageLayout>
  );
}
