"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { DeleteRecipeButton } from "@/components/meals/delete-recipe-button";
import type { MealRecipe } from "@/components/meals/types";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";

type RecipeRowProps = {
  recipe: MealRecipe;
  onOpen: (recipe: MealRecipe) => void;
  overlay?: boolean;
};

export function RecipeRow({ recipe, onOpen, overlay = false }: RecipeRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: recipe.id,
    data: { recipeId: recipe.id },
    disabled: overlay,
  });

  const style = isDragging ? undefined : { transform: CSS.Translate.toString(transform) };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-2 py-1.5 shadow-sm",
        isDragging && "opacity-0",
        overlay && "cursor-grabbing shadow-lg",
      )}
    >
      {!overlay ? (
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="shrink-0 cursor-grab rounded p-0.5 text-text-muted hover:text-text-main active:cursor-grabbing"
          aria-label={`Drag ${recipe.name}`}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      ) : (
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-text-muted" />
      )}

      <button
        type="button"
        onClick={() => onOpen(recipe)}
        className="min-w-0 flex-1 cursor-pointer text-left text-sm font-medium text-text-main hover:opacity-70"
      >
        {recipe.name}
      </button>

      {recipe.servings ? (
        <Chip className="bg-warm-amber text-[#6b3800] normal-case tracking-normal">
          {recipe.servings} servings
        </Chip>
      ) : null}

      {!overlay && <DeleteRecipeButton recipeId={recipe.id} recipeName={recipe.name} />}
    </article>
  );
}
