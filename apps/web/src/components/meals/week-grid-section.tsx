"use client";

import { useDroppable } from "@dnd-kit/core";
import { X } from "lucide-react";
import type { MealPlanSlot as MealPlanSlotType } from "@/components/meals/types";
import type { MealSlot, WeekDay } from "@/graphql";
import { mealPlanSlotKey } from "@life/shared";
import { mealSlotLabels, weekDayLabels } from "@/lib/meal-plan-ui";
import { cn } from "@/lib/cn";

type MealSlotCellProps = {
  day: WeekDay;
  slot: MealSlot;
  assignment?: MealPlanSlotType;
  onClear: (day: WeekDay, slot: MealSlot) => void;
};

export function MealSlotCell({ day, slot, assignment, onClear }: MealSlotCellProps) {
  const droppableId = mealPlanSlotKey(day, slot);
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-16 rounded-lg border border-dashed border-border-subtle bg-background p-2",
        isOver && "border-primary bg-warm-amber/30",
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          {mealSlotLabels[slot]}
        </span>
        {assignment?.recipe ? (
          <button
            type="button"
            onClick={() => onClear(day, slot)}
            className="rounded p-0.5 text-text-muted hover:text-error"
            aria-label={`Clear ${mealSlotLabels[slot]}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      {assignment?.recipe ? (
        <p className="text-sm font-medium leading-snug text-text-main">{assignment.recipe.name}</p>
      ) : (
        <p className="text-xs text-text-muted">Drop recipe</p>
      )}
    </div>
  );
}

type WeekGridSectionProps = {
  slots: MealPlanSlotType[];
  onClear: (day: WeekDay, slot: MealSlot) => void;
};

export function WeekGridSection({ slots, onClear }: WeekGridSectionProps) {
  const slotMap = new Map(slots.map((entry) => [mealPlanSlotKey(entry.day, entry.slot), entry]));

  return (
    <section className="rounded-xl border border-border-subtle bg-surface">
      <header className="border-b border-border-subtle bg-warm-amber/40 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">Weekly plan</h2>
      </header>

      <div className="overflow-x-auto p-3">
        <div className="grid min-w-[760px] grid-cols-7 gap-3">
          {(["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as WeekDay[]).map(
            (day) => (
              <div key={day} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {weekDayLabels[day]}
                </h3>
                {(["BREAKFAST", "LUNCH", "DINNER"] as MealSlot[]).map((slot) => (
                  <MealSlotCell
                    key={`${day}-${slot}`}
                    day={day}
                    slot={slot}
                    assignment={slotMap.get(mealPlanSlotKey(day, slot))}
                    onClear={onClear}
                  />
                ))}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
