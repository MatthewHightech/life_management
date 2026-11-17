"use client";

import { useQuery } from "@apollo/client";
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
  subDays,
  subMonths,
  subWeeks,
} from "@life/shared";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { TasksBoardQuery, TasksBoardQueryVariables } from "@/graphql";
import { TASKS_BOARD_QUERY } from "@/graphql";
import { useTaskBoards } from "@/components/tasks/task-boards-context";
import { useTaskComments } from "@/components/tasks/task-comments-context";
import { TasksPageLayout } from "@/components/tasks/tasks-page-layout";
import type { BoardTask } from "@/components/tasks/task-table/types";
import { tasksOnBoard } from "@/lib/task-boards";
import { tasksBoardCalendarQuery } from "@/lib/task-board-queries";
import { kanbanColumns } from "@/lib/task-status";
import { cn } from "@/lib/cn";

type CalendarScope = "month" | "week" | "day";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const calendarScopes: { id: CalendarScope; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
];

const statusDotClass = Object.fromEntries(
  kanbanColumns.map((column) => [column.status, column.dotClass]),
) as Record<BoardTask["status"], string>;

function CalendarNavButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-md p-1.5 text-text-muted transition hover:bg-background hover:text-text-main"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function CalendarScopeToggle({
  value,
  onChange,
}: {
  value: CalendarScope;
  onChange: (scope: CalendarScope) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border-subtle bg-background p-1">
      {calendarScopes.map((scope) => {
        const active = scope.id === value;

        return (
          <button
            key={scope.id}
            type="button"
            onClick={() => onChange(scope.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm",
              active ? "bg-surface text-primary shadow-sm" : "text-text-muted",
            )}
          >
            {scope.label}
          </button>
        );
      })}
    </div>
  );
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

function shiftFocus(focus: Date, scope: CalendarScope, direction: -1 | 1): Date {
  if (scope === "month") {
    return startOfDay(direction < 0 ? subMonths(focus, 1) : addMonths(focus, 1));
  }
  if (scope === "week") {
    return startOfDay(direction < 0 ? subWeeks(focus, 1) : addWeeks(focus, 1));
  }
  return startOfDay(direction < 0 ? subDays(focus, 1) : addDays(focus, 1));
}

function scopeTitle(focus: Date, scope: CalendarScope): string {
  if (scope === "month") {
    return formatMonthYear(focus);
  }
  if (scope === "week") {
    return formatWeekRange(focus);
  }
  return formatLongDate(focus);
}

function navLabel(scope: CalendarScope, direction: "previous" | "next"): string {
  return `${direction === "previous" ? "Previous" : "Next"} ${scope}`;
}

function CalendarTaskChip({ task }: { task: BoardTask }) {
  const { openComments, activeTask } = useTaskComments();
  const done = task.status === "DONE";
  const overdue = task.isOverdue && !done;
  const isActive = activeTask?.id === task.id;

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
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDotClass[task.status])} />
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

function CalendarDayCell({
  day,
  focus,
  today,
  tasks,
  dimOutsideMonth,
}: {
  day: Date;
  focus: Date;
  today: Date;
  tasks: BoardTask[];
  dimOutsideMonth: boolean;
}) {
  const inMonth = isSameMonth(day, focus);
  const isToday = isSameDay(day, today);
  const muted = dimOutsideMonth && !inMonth;

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

function MonthView({
  focus,
  today,
  tasksByDay,
}: {
  focus: Date;
  today: Date;
  tasksByDay: Map<string, BoardTask[]>;
}) {
  const days = useMemo(() => buildMonthGrid(focus), [focus]);
  const weekCount = Math.ceil(days.length / 7);

  return (
    <>
      <div className="grid shrink-0 grid-cols-7 border-b border-border-subtle">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="border-r border-border-subtle px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted last:border-r-0"
          >
            {label}
          </div>
        ))}
      </div>

      <div
        className="grid min-h-0 flex-1 border-l border-t border-border-subtle"
        style={{ gridTemplateRows: `repeat(${weekCount}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: weekCount }, (_, weekIndex) => (
          <div key={weekIndex} className="grid min-h-0 grid-cols-7">
            {days.slice(weekIndex * 7, weekIndex * 7 + 7).map((day) => {
              const key = calendarDayKey(day);
              return (
                <CalendarDayCell
                  key={key}
                  day={day}
                  focus={focus}
                  today={today}
                  tasks={tasksByDay.get(key) ?? []}
                  dimOutsideMonth
                />
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

function WeekView({
  focus,
  today,
  tasksByDay,
}: {
  focus: Date;
  today: Date;
  tasksByDay: Map<string, BoardTask[]>;
}) {
  const days = useMemo(() => buildWeekDays(focus), [focus]);

  return (
    <>
      <div className="grid shrink-0 grid-cols-7 border-b border-border-subtle">
        {days.map((day) => (
          <div
            key={calendarDayKey(day)}
            className="border-r border-border-subtle px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted last:border-r-0"
          >
            {WEEKDAY_LABELS[day.getDay()]}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 border-l border-t border-border-subtle">
        {days.map((day) => {
          const key = calendarDayKey(day);
          return (
            <CalendarDayCell
              key={key}
              day={day}
              focus={focus}
              today={today}
              tasks={tasksByDay.get(key) ?? []}
              dimOutsideMonth={false}
            />
          );
        })}
      </div>
    </>
  );
}

function DayView({
  focus,
  today,
  tasks,
}: {
  focus: Date;
  today: Date;
  tasks: BoardTask[];
}) {
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

export function TaskCalendarBoard() {
  const { boards, boardsLoading, activeBoardId } = useTaskBoards();
  const [scope, setScope] = useState<CalendarScope>("month");
  const [focus, setFocus] = useState(() => startOfDay(new Date()));
  const today = useMemo(() => startOfDay(new Date()), []);

  const { data, loading, error } = useQuery<TasksBoardQuery, TasksBoardQueryVariables>(TASKS_BOARD_QUERY, {
    variables: tasksBoardCalendarQuery.variables,
  });

  const boardTasks = useMemo(
    () => tasksOnBoard(data?.tasks ?? [], activeBoardId, boards[0]?.id ?? null),
    [activeBoardId, boards, data?.tasks],
  );

  const tasksByDay = useMemo(() => tasksByDueDay(boardTasks), [boardTasks]);
  const dayTasks = tasksByDay.get(calendarDayKey(focus)) ?? [];

  const waiting = loading || (boardsLoading && !activeBoardId);

  return (
    <TasksPageLayout>
      {waiting && <p className="text-sm text-text-muted">Loading tasks…</p>}
      {error && <p className="text-sm text-error">Could not load tasks: {error.message}</p>}

      {!waiting && !error && (
        <div className="flex h-[calc(100dvh-11.5rem)] min-h-[28rem] flex-col rounded-xl border border-border-subtle bg-surface">
          <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border-subtle px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2 justify-self-start">
              <CalendarNavButton
                label={navLabel(scope, "previous")}
                icon={ChevronLeft}
                onClick={() => setFocus((current) => shiftFocus(current, scope, -1))}
              />
              <CalendarScopeToggle value={scope} onChange={setScope} />
            </div>

            <h2 className="justify-self-center text-center text-base font-semibold text-text-main">
              {scopeTitle(focus, scope)}
            </h2>

            <div className="flex items-center gap-2 justify-self-end">
              <button
                type="button"
                onClick={() => setFocus(today)}
                className="rounded-md px-2 py-1 text-xs font-medium text-text-muted transition hover:bg-background hover:text-text-main"
              >
                Today
              </button>
              <CalendarNavButton
                label={navLabel(scope, "next")}
                icon={ChevronRight}
                onClick={() => setFocus((current) => shiftFocus(current, scope, 1))}
              />
            </div>
          </div>

          {scope === "month" ? (
            <MonthView focus={focus} today={today} tasksByDay={tasksByDay} />
          ) : null}
          {scope === "week" ? (
            <WeekView focus={focus} today={today} tasksByDay={tasksByDay} />
          ) : null}
          {scope === "day" ? <DayView focus={focus} today={today} tasks={dayTasks} /> : null}
        </div>
      )}
    </TasksPageLayout>
  );
}
