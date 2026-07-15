"use client";

import { useLazyQuery } from "@apollo/client";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { IMPORT_RECIPE_FROM_URL_QUERY } from "@/graphql";
import type { ImportRecipeFromUrlQuery, ImportRecipeFromUrlQueryVariables } from "@/graphql";
import type { RecipeFormValues } from "@/components/meals/types";

type ImportRecipeUrlModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (values: RecipeFormValues) => void;
};

export function ImportRecipeUrlModal({ open, onOpenChange, onImported }: ImportRecipeUrlModalProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [importRecipe, { loading }] = useLazyQuery<
    ImportRecipeFromUrlQuery,
    ImportRecipeFromUrlQueryVariables
  >(IMPORT_RECIPE_FROM_URL_QUERY, {
    fetchPolicy: "network-only",
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a recipe URL to import.");
      return;
    }

    try {
      const result = await importRecipe({ variables: { url: trimmed } });
      if (result.error) {
        const graphMessage = result.error.graphQLErrors[0]?.message;
        throw new Error(graphMessage ?? result.error.message);
      }
      const draft = result.data?.importRecipeFromUrl;
      if (!draft) {
        throw new Error("Could not import that recipe.");
      }

      onImported({
        name: draft.name,
        instructions: draft.instructions ?? "",
        servings: draft.servings?.toString() ?? "",
        ingredients:
          draft.ingredients.length > 0
            ? draft.ingredients.map((ingredient) => ({
                name: ingredient.name,
                quantity: ingredient.quantity ?? "",
                unit: ingredient.unit ?? "",
              }))
            : [{ name: "", quantity: "", unit: "" }],
      });
      setUrl("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import that recipe.");
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setError(null);
        }
      }}
      title="Import recipe from URL"
      description="Paste a link from a recipe site. We read the page’s structured recipe data — no AI."
      className="w-[min(100%-2rem,32rem)]"
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-main">Recipe URL</span>
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://…"
            className="min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
            autoFocus
            required
          />
        </label>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !url.trim()}>
            {loading ? "Importing…" : "Import"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
