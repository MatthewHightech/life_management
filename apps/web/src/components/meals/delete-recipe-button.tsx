"use client";

import { useMutation } from "@apollo/client";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteRecipeDocument } from "@/graphql";
import { MEAL_PLAN_REFETCH } from "@/lib/refetch-queries";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type DeleteRecipeButtonProps = {
  recipeId: string;
  recipeName: string;
};

export function DeleteRecipeButton({ recipeId, recipeName }: DeleteRecipeButtonProps) {
  const [open, setOpen] = useState(false);
  const [deleteRecipe, { loading }] = useMutation(DeleteRecipeDocument, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded p-1 text-text-muted hover:bg-background hover:text-error"
        aria-label={`Delete ${recipeName}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <ConfirmModal
        open={open}
        onOpenChange={setOpen}
        title="Delete recipe?"
        description={`"${recipeName}" will be removed from your library and cleared from this week's plan.`}
        confirmLabel="Delete"
        loadingLabel="Deleting…"
        loading={loading}
        onConfirm={async () => {
          await deleteRecipe({ variables: { id: recipeId } });
          setOpen(false);
        }}
      />
    </>
  );
}
