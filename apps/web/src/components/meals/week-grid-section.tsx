"use client";

import { useDroppable } from "@dnd-kit/core";
import { mealPlanSlotKey, WEEK_DAYS, type WeekDay } from "@life/shared";
import { X } from "lucide-react";
import { forwardRef } from "react";
import { recipeServingsLabel } from "@/components/meals/recipe-multiplier-control";
import type { MealPlanSlot as MealPlanSlotType, MealRecipe } from "@/components/meals/types";
import { Chip } from "@/components/ui/chip";
import { DAY_MEAL_SLOT, weekDayFullLabels } from "@/lib/meal-plan-ui";
import { sectionCardClass, sectionHeaderClass } from "@/lib/section-header";
import { cn } from "@/lib/cn";

type MealDayCellProps = {
  day: WeekDay;
  assignment?: MealPlanSlotType;
  onClear: (day: WeekDay) => void;
  onOpenRecipe: (recipe: MealRecipe) => void;
};

function MealDayCell({ day, assignment, onClear, onOpenRecipe }: MealDayCellProps) {
  const droppableId = mealPlanSlotKey(day, DAY_MEAL_SLOT);
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { zone: "schedule", day, slot: DAY_MEAL_SLOT },
  });
  const recipe = assignment?.recipe;
  const servingsLabel = recipe ? recipeServingsLabel(recipe) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5">
      <h3 className="shrink-0 text-xs font-semibold uppercase tracking-wide text-text-muted">
        {weekDayFullLabels[day]}
      </h3>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-0 flex-1 flex-col rounded-lg border border-dashed border-border-subtle bg-background p-2.5",
          isOver && "border-primary bg-warm-amber/30",
        )}
      >
        {recipe ? (
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => onOpenRecipe(recipe)}
              className="min-w-0 flex-1 cursor-pointer text-left hover:opacity-70"
            >
              <p className="text-sm font-medium leading-snug text-text-main">{recipe.name}</p>
              {servingsLabel ? (
                <Chip className="mt-1 bg-warm-amber text-[#6b3800] normal-case tracking-normal">
                  {servingsLabel}
                </Chip>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => onClear(day)}
              className="shrink-0 rounded p-0.5 text-text-muted hover:text-error"
              aria-label={`Clear ${weekDayFullLabels[day]}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-text-muted">Drop recipe</p>
        )}
      </div>
    </div>
  );
}

type WeekGridSectionProps = {
  slots: MealPlanSlotType[];
  onClear: (day: WeekDay) => void;
  onOpenRecipe: (recipe: MealRecipe) => void;
};

function assignmentForDay(slots: MealPlanSlotType[], day: WeekDay) {
  const daySlots = slots.filter((entry) => entry.day === day && entry.recipe);
  return daySlots.find((entry) => entry.slot === DAY_MEAL_SLOT) ?? daySlots[0];
}

export const WeekGridSection = forwardRef<HTMLElement, WeekGridSectionProps>(function WeekGridSection(
  { slots, onClear, onOpenRecipe },
  ref,
) {
  return (
    <section ref={ref} className={cn(sectionCardClass, "flex h-full min-h-0 flex-col")}>
      <header className={cn(sectionHeaderClass, "shrink-0")}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">Weekly plan</h2>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        {WEEK_DAYS.map((day) => (
          <MealDayCell
            key={day}
            day={day}
            assignment={assignmentForDay(slots, day)}
            onClear={onClear}
            onOpenRecipe={onOpenRecipe}
          />
        ))}
      </div>
    </section>
  );
});
