"use client";

import { useMutation } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { CreateGearItemDocument, UpdateGearItemDocument } from "@/graphql";
import { GEAR_PAGE_REFETCH } from "@/lib/refetch-queries";
import { uploadGearPhoto } from "@/lib/file-api";
import type { GearItem } from "@/components/gear/types";
import {
  GearConditionField,
  GearFormModal,
  GearTextField,
  useGearFormValues,
} from "@/components/gear/gear-form";
import { Button } from "@/components/ui/button";

function toFormValues(item?: GearItem | null) {
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
  const { values: form, setField } = useGearFormValues(open, item, toFormValues);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPhotoFile(null);
    }
  }, [open, item]);

  const mutationOptions = { refetchQueries: [...GEAR_PAGE_REFETCH] };
  const [createItem, { loading: creating }] = useMutation(CreateGearItemDocument, mutationOptions);
  const [updateItem, { loading: updating }] = useMutation(UpdateGearItemDocument, mutationOptions);

  async function handleSubmit() {
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

    let itemId = item?.id;
    if (item) {
      await updateItem({ variables: { id: item.id, input } });
    } else {
      const result = await createItem({ variables: { input } });
      itemId = result.data?.createGearItem.id;
    }
    if (itemId && photoFile) {
      await uploadGearPhoto("item", itemId, photoFile);
    }
    onOpenChange(false);
  }

  return (
    <GearFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={item ? "Edit gear item" : "Add gear item"}
      submitLabel={item ? "Save changes" : "Add item"}
      loading={creating || updating}
      fallbackError="Could not save item."
      onSubmit={handleSubmit}
    >
      <GearTextField label="Name" required value={form.name} onChange={setField("name")} />
      <GearTextField label="Description" multiline value={form.description} onChange={setField("description")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <GearTextField label="Size" value={form.size} onChange={setField("size")} />
        <GearConditionField value={form.condition} onChange={setField("condition")} />
      </div>
      <GearTextField
        label="Care instructions"
        multiline
        value={form.careInstructions}
        onChange={setField("careInstructions")}
      />
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
    </GearFormModal>
  );
}
