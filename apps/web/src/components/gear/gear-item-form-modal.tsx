"use client";

import { useMutation } from "@apollo/client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { CREATE_GEAR_ITEM_MUTATION, UPDATE_GEAR_ITEM_MUTATION } from "@/graphql";
import { GEAR_PAGE_REFETCH } from "@/lib/gear-queries";
import { uploadGearItemPhoto } from "@/lib/gear-photo";
import type { GearItem, GearItemFormValues } from "@/components/gear/types";
import { GEAR_CONDITION_OPTIONS } from "@/components/gear/gear-condition-chip";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

function toFormValues(item?: GearItem | null): GearItemFormValues {
  return {
    name: item?.name ?? "",
    description: item?.description ?? "",
    size: item?.size ?? "",
    careInstructions: item?.careInstructions ?? "",
    condition: item?.condition ?? "GOOD",
  };
}

type GearItemFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: GearItem | null;
  folderId?: string | null;
};

export function GearItemFormModal({
  open,
  onOpenChange,
  item,
  folderId = null,
}: GearItemFormModalProps) {
  const [form, setForm] = useState<GearItemFormValues>(() => toFormValues(item));
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(item);

  useEffect(() => {
    if (open) {
      setForm(toFormValues(item));
      setPhotoFile(null);
      setError(null);
    }
  }, [open, item]);

  const [createItem, { loading: creating }] = useMutation(CREATE_GEAR_ITEM_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
  });

  const [updateItem, { loading: updating }] = useMutation(UPDATE_GEAR_ITEM_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
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
      size: form.size.trim() || null,
      careInstructions: form.careInstructions.trim() || null,
      condition: form.condition,
      folderId,
    };

    try {
      if (isEdit && item) {
        await updateItem({ variables: { id: item.id, input } });
        if (photoFile) {
          await uploadGearItemPhoto(item.id, photoFile);
        }
      } else {
        const result = await createItem({ variables: { input } });
        const createdId = result.data?.createGearItem.id;
        if (createdId && photoFile) {
          await uploadGearItemPhoto(createdId, photoFile);
        }
      }
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save item.");
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit gear item" : "Add gear item"}
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
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-text-muted">Size</span>
            <input
              value={form.size}
              onChange={(event) => setForm((current) => ({ ...current, size: event.target.value }))}
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-text-muted">Condition</span>
            <select
              value={form.condition}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  condition: event.target.value as GearItemFormValues["condition"],
                }))
              }
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2"
            >
              {GEAR_CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-text-muted">Care instructions</span>
          <textarea
            value={form.careInstructions}
            onChange={(event) =>
              setForm((current) => ({ ...current, careInstructions: event.target.value }))
            }
            rows={2}
            className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2"
          />
        </label>
        <div>
          <span className="mb-1 block text-sm text-text-muted">Photo (optional)</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoFile ? photoFile.name : "Choose photo"}
          </Button>
        </div>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Add item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
