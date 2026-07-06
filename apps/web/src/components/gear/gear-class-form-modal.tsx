"use client";

import { useMutation } from "@apollo/client";
import { FormEvent, useEffect, useState } from "react";
import { CREATE_GEAR_CLASS_MUTATION, UPDATE_GEAR_CLASS_MUTATION } from "@/graphql";
import { GEAR_PAGE_REFETCH } from "@/lib/gear-queries";
import type { GearClassFormValues, GearItemClass } from "@/components/gear/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

function toFormValues(itemClass?: GearItemClass | null): GearClassFormValues {
  return {
    name: itemClass?.name ?? "",
    description: itemClass?.description ?? "",
    careInstructions: itemClass?.careInstructions ?? "",
  };
}

type GearClassFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemClass?: GearItemClass | null;
  folderId?: string | null;
};

export function GearClassFormModal({
  open,
  onOpenChange,
  itemClass,
  folderId = null,
}: GearClassFormModalProps) {
  const [form, setForm] = useState<GearClassFormValues>(() => toFormValues(itemClass));
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(itemClass);

  useEffect(() => {
    if (open) {
      setForm(toFormValues(itemClass));
      setError(null);
    }
  }, [open, itemClass]);

  const [createClass, { loading: creating }] = useMutation(CREATE_GEAR_CLASS_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    onCompleted: () => onOpenChange(false),
  });

  const [updateClass, { loading: updating }] = useMutation(UPDATE_GEAR_CLASS_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    onCompleted: () => onOpenChange(false),
  });

  const loading = creating || updating;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      return;
    }

    const input = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      careInstructions: form.careInstructions.trim() || null,
      folderId,
    };

    try {
      if (isEdit && itemClass) {
        await updateClass({ variables: { id: itemClass.id, input } });
      } else {
        await createClass({ variables: { input } });
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save class.");
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit item class" : "Add item class"}
      className="w-[min(100%-2rem,36rem)]"
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-text-muted">Name</span>
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-text-muted">Description</span>
          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            rows={2}
            className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-text-muted">Care instructions (shared by variants)</span>
          <textarea
            value={form.careInstructions}
            onChange={(event) =>
              setForm((current) => ({ ...current, careInstructions: event.target.value }))
            }
            rows={2}
            className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Add class"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
