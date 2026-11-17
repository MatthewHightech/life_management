"use client";

import { useMutation } from "@apollo/client";
import { CreateGearItemClassDocument, UpdateGearItemClassDocument } from "@/graphql";
import { GEAR_PAGE_REFETCH } from "@/lib/refetch-queries";
import type { GearItemClass } from "@/components/gear/types";
import { GearFormModal, GearTextField, useGearFormValues } from "@/components/gear/gear-form";

function toFormValues(itemClass?: GearItemClass | null) {
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
  const { values: form, setField } = useGearFormValues(open, itemClass, toFormValues);
  const mutationOptions = {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    onCompleted: () => onOpenChange(false),
  };
  const [createClass, { loading: creating }] = useMutation(CreateGearItemClassDocument, mutationOptions);
  const [updateClass, { loading: updating }] = useMutation(UpdateGearItemClassDocument, mutationOptions);

  async function handleSubmit() {
    if (!form.name.trim()) {
      return;
    }

    const input = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      careInstructions: form.careInstructions.trim() || null,
      folderId,
    };

    if (itemClass) {
      await updateClass({ variables: { id: itemClass.id, input } });
    } else {
      await createClass({ variables: { input } });
    }
  }

  return (
    <GearFormModal
      open={open}
      onOpenChange={onOpenChange}
      title={itemClass ? "Edit item class" : "Add item class"}
      submitLabel={itemClass ? "Save changes" : "Add class"}
      loading={creating || updating}
      fallbackError="Could not save class."
      onSubmit={handleSubmit}
    >
      <GearTextField label="Name" required value={form.name} onChange={setField("name")} />
      <GearTextField label="Description" multiline value={form.description} onChange={setField("description")} />
      <GearTextField
        label="Care instructions (shared by variants)"
        multiline
        value={form.careInstructions}
        onChange={setField("careInstructions")}
      />
    </GearFormModal>
  );
}
