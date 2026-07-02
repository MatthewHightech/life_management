"use client";

import { useMutation, type InternalRefetchQueriesInclude } from "@apollo/client";
import { FormEvent, useEffect, useState } from "react";
import { CREATE_FOLDER_MUTATION } from "@/graphql";
import type { FolderColor, FolderNamespace } from "@life/shared";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FOLDER_COLOR_OPTIONS } from "@/lib/folder-colors";
import { cn } from "@/lib/cn";

type FolderFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  namespace: FolderNamespace;
  parentId: string | null;
  refetchQueries?: InternalRefetchQueriesInclude;
};

export function FolderFormModal({
  open,
  onOpenChange,
  namespace,
  parentId,
  refetchQueries = [],
}: FolderFormModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<FolderColor>("BLUSH");

  useEffect(() => {
    if (open) {
      setName("");
      setColor("BLUSH");
    }
  }, [open]);

  const [createFolder, { loading }] = useMutation(CREATE_FOLDER_MUTATION, {
    refetchQueries,
    awaitRefetchQueries: true,
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
          namespace,
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
      description="Pick a name and color for your folder."
      className="w-[min(100%-2rem,28rem)]"
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-main">Folder name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
            required
            autoFocus
          />
        </label>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-text-main">Color</legend>
          <div className="flex flex-wrap gap-2">
            {FOLDER_COLOR_OPTIONS.map((option) => (
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
