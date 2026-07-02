"use client";

import { useMutation } from "@apollo/client";
import { useState } from "react";
import { DELETE_RECIPE_MUTATION } from "@/graphql";
import { MEAL_PLAN_REFETCH } from "@/lib/meal-plan-queries";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type DeleteRecipeButtonProps = {
  recipeId: string;
  recipeName: string;
  className?: string;
};

export function DeleteRecipeButton({ recipeId, recipeName, className }: DeleteRecipeButtonProps) {
  const [open, setOpen] = useState(false);
  const [deleteRecipe, { loading }] = useMutation(DELETE_RECIPE_MUTATION, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
  });

  async function handleConfirm() {
    await deleteRecipe({ variables: { id: recipeId } });
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("text-xs text-text-muted hover:text-error", className)}
      >
        Delete
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Delete recipe?"
        description={`"${recipeName}" will be removed from your library and cleared from this week's plan.`}
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={loading} onClick={() => void handleConfirm()}>
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
