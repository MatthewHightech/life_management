"use client";

import { useDroppable } from "@dnd-kit/core";
import type { MealRecipeFolder } from "@/components/meals/types";
import { getRecipeFolderColorOption } from "@/lib/recipe-folder-colors";
import { recipeFolderDropId } from "@life/shared";
import { MEAL_PLAN_DROP_ZONE } from "@/lib/meal-plan-dnd";
import { cn } from "@/lib/cn";

type RecipeFolderTileProps = {
  folder: MealRecipeFolder;
  onOpen: (folderId: string) => void;
};

export function RecipeFolderTile({ folder, onOpen }: RecipeFolderTileProps) {
  const colors = getRecipeFolderColorOption(folder.color);
  const { isOver, setNodeRef } = useDroppable({
    id: recipeFolderDropId(folder.id),
    data: { zone: MEAL_PLAN_DROP_ZONE.RECIPE, folderId: folder.id },
  });

  const itemCount = folder.recipeCount + folder.childFolderCount;
  const itemLabel = itemCount === 1 ? "1 item" : `${itemCount} items`;

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onOpen(folder.id)}
      className={cn(
        "relative inline-flex w-fit shrink-0 flex-col gap-0.5 rounded-md rounded-tl-none border border-black/10 px-2.5 py-1.5 text-left shadow-sm transition",
        colors.swatch,
        isOver ? "ring-2 ring-primary/50" : "hover:brightness-[0.97]",
      )}
    >
      <span
        className={cn("absolute -top-1 left-0 h-1.5 w-5 rounded-t-sm border border-black/10 border-b-0", colors.swatch)}
        aria-hidden
      />
      <span className="truncate text-sm font-medium text-text-main">{folder.name}</span>
      <span className="text-[0.65rem] text-text-muted">{itemLabel}</span>
    </button>
  );
}
