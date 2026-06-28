"use client";

import {
  addMonths,
  buildMonthGrid,
  calendarDayKey,
  formatMonthYear,
  isSameDay,
  isSameMonth,
  startOfDay,
  subMonths,
} from "@life/shared";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

type CalendarPickerProps = {
  value?: Date | null;
  onSelect: (date: Date) => void;
  onClear?: () => void;
};

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
      className="rounded-md p-1 text-text-muted transition hover:bg-background hover:text-text-main"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function CalendarPicker({ value, onSelect, onClear }: CalendarPickerProps) {
  const [viewMonth, setViewMonth] = useState(() => startOfDay(value ?? new Date()));
  const today = useMemo(() => startOfDay(new Date()), []);
  const days = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  useEffect(() => {
    if (value) {
      setViewMonth(startOfDay(value));
    }
  }, [value]);

  return (
    <div className="w-64 p-3">
      <div className="mb-3 flex items-center justify-between">
        <CalendarNavButton
          label="Previous month"
          icon={ChevronLeft}
          onClick={() => setViewMonth((current) => subMonths(current, 1))}
        />
        <p className="text-sm font-semibold text-text-main">{formatMonthYear(viewMonth)}</p>
        <CalendarNavButton
          label="Next month"
          icon={ChevronRight}
          onClick={() => setViewMonth((current) => addMonths(current, 1))}
        />
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-center text-[10px] font-semibold uppercase text-text-muted">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const selected = value ? isSameDay(day, value) : false;
          const inMonth = isSameMonth(day, viewMonth);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={calendarDayKey(day)}
              type="button"
              onClick={() => onSelect(startOfDay(day))}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm transition",
                !inMonth && "text-text-muted/40",
                inMonth && !selected && "text-text-main hover:bg-background",
                isToday && !selected && "ring-1 ring-primary/30",
                selected && "bg-primary font-semibold text-on-primary hover:bg-primary-container",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {onClear && value && (
        <button
          type="button"
          onClick={onClear}
          className="mt-3 w-full rounded-md px-2 py-1.5 text-xs text-text-muted transition hover:bg-background hover:text-text-main"
        >
          Clear date
        </button>
      )}
    </div>
  );
}
