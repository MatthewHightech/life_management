"use client";

import { useMutation } from "@apollo/client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { CREATE_GEAR_VARIANT_MUTATION, UPDATE_GEAR_VARIANT_MUTATION } from "@/graphql";
import { GEAR_PAGE_REFETCH } from "@/lib/gear-queries";
import { uploadGearVariantPhoto } from "@/lib/gear-photo";
import type { GearItemClass, GearVariant, GearVariantFormValues } from "@/components/gear/types";
import { GEAR_CONDITION_OPTIONS } from "@/components/gear/gear-condition-chip";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

function toFormValues(variant?: GearVariant | null): GearVariantFormValues {
  return {
    name: variant?.name ?? "",
    size: variant?.size ?? "",
    condition: variant?.condition ?? "GOOD",
  };
}

type GearVariantFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemClass: GearItemClass | null;
  variant?: GearVariant | null;
};

export function GearVariantFormModal({
  open,
  onOpenChange,
  itemClass,
  variant,
}: GearVariantFormModalProps) {
  const [form, setForm] = useState<GearVariantFormValues>(() => toFormValues(variant));
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(variant);

  useEffect(() => {
    if (open) {
      setForm(toFormValues(variant));
      setPhotoFile(null);
      setError(null);
    }
  }, [open, variant]);

  const [createVariant, { loading: creating }] = useMutation(CREATE_GEAR_VARIANT_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
  });

  const [updateVariant, { loading: updating }] = useMutation(UPDATE_GEAR_VARIANT_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
  });

  const loading = creating || updating;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim() || !itemClass) {
      return;
    }

    const input = {
      name: form.name.trim(),
      size: form.size.trim() || null,
      condition: form.condition,
    };

    try {
      if (isEdit && variant) {
        await updateVariant({ variables: { id: variant.id, input } });
        if (photoFile) {
          await uploadGearVariantPhoto(variant.id, photoFile);
        }
      } else {
        const result = await createVariant({
          variables: { input: { ...input, classId: itemClass.id } },
        });
        const createdId = result.data?.createGearVariant.id;
        if (createdId && photoFile) {
          await uploadGearVariantPhoto(createdId, photoFile);
        }
      }
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save variant.");
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit variant" : `Add variant to ${itemClass?.name ?? "class"}`}
      className="w-[min(100%-2rem,32rem)]"
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
                  condition: event.target.value as GearVariantFormValues["condition"],
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
        <div>
          <span className="mb-1 block text-sm text-text-muted">Photo (optional)</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
          />
          <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()}>
            {photoFile ? photoFile.name : "Choose photo"}
          </Button>
        </div>
        {error ? <p className="text-sm text-error">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !itemClass}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Add variant"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
