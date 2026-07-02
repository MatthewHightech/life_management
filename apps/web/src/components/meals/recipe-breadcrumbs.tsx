"use client";

import { useDroppable } from "@dnd-kit/core";
import { ChevronRight } from "lucide-react";
import type { MealRecipeFolder } from "@/components/meals/types";
import { cn } from "@/lib/cn";
import { recipeFolderDropId } from "@life/shared";
import { MEAL_PLAN_DROP_ZONE } from "@/lib/meal-plan-dnd";

type RecipeBreadcrumbsProps = {
  path: MealRecipeFolder[];
  onNavigate: (folderId: string | null) => void;
};

function BreadcrumbDropTarget({
  folderId,
  label,
  onNavigate,
  isLast,
}: {
  folderId: string | null;
  label: string;
  onNavigate: (folderId: string | null) => void;
  isLast?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: recipeFolderDropId(folderId),
    data: { zone: MEAL_PLAN_DROP_ZONE.RECIPE, folderId },
  });

  return (
    <li className="flex min-w-0 items-center gap-1">
      {!isLast ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden /> : null}
      <button
        ref={setNodeRef}
        type="button"
        onClick={() => onNavigate(folderId)}
        className={cn(
          "truncate rounded px-1 py-0.5 text-sm transition",
          isLast ? "font-medium text-text-main" : "text-text-muted hover:text-text-main",
          isOver && "bg-primary/10 text-primary",
        )}
        aria-current={isLast ? "page" : undefined}
      >
        {label}
      </button>
    </li>
  );
}

export function RecipeBreadcrumbs({ path, onNavigate }: RecipeBreadcrumbsProps) {
  return (
    <nav aria-label="Recipe folders" className="border-b border-border-subtle px-4 py-2">
      <ol className="flex min-w-0 flex-wrap items-center gap-1">
        <BreadcrumbDropTarget folderId={null} label="Recipes" onNavigate={onNavigate} isLast={path.length === 0} />
        {path.map((folder, index) => (
          <BreadcrumbDropTarget
            key={folder.id}
            folderId={folder.id}
            label={folder.name}
            onNavigate={onNavigate}
            isLast={index === path.length - 1}
          />
        ))}
      </ol>
    </nav>
  );
}
