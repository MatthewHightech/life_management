"use client";

import { useMutation } from "@apollo/client";
import { FormEvent, useEffect, useState } from "react";
import { CREATE_RECIPE_FOLDER_MUTATION } from "@/graphql";
import type { RecipeFolderColor } from "@life/shared";
import { MEAL_PLAN_REFETCH } from "@/lib/meal-plan-queries";
import { RECIPE_FOLDER_COLOR_OPTIONS } from "@/lib/recipe-folder-colors";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type RecipeFolderFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string | null;
};

export function RecipeFolderFormModal({ open, onOpenChange, parentId }: RecipeFolderFormModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<RecipeFolderColor>("BLUSH");

  useEffect(() => {
    if (open) {
      setName("");
      setColor("BLUSH");
    }
  }, [open]);

  const [createFolder, { loading }] = useMutation(CREATE_RECIPE_FOLDER_MUTATION, {
    refetchQueries: [...MEAL_PLAN_REFETCH],
    onCompleted: () => onOpenChange(false),
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    await createFolder({
      variables: {
        input: {
          name: trimmedName,
          color,
          parentId,
        },
      },
    });
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New folder"
      description="Organize recipes with colored folders. Drag recipes onto a folder to file them."
      className="w-[min(100%-2rem,28rem)]"
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-main">Folder name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Weeknight dinners"
            required
            autoFocus
          />
        </label>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-text-main">Color</legend>
          <div className="flex flex-wrap gap-2">
            {RECIPE_FOLDER_COLOR_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setColor(option.value)}
                className={cn(
                  "h-5 w-5 rounded-full border-2 transition",
                  option.swatch,
                  color === option.value
                    ? "border-text-main ring-2 ring-primary/30"
                    : "border-transparent hover:scale-110",
                )}
                aria-label={option.label}
                aria-pressed={color === option.value}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Creating…" : "Create folder"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
