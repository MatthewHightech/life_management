"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_BUDGET_SECTION_MUTATION } from "@/graphql";
import type { BudgetScope } from "@/components/finance/budget/budget-scope";
import { BUDGET_PAGE_REFETCH } from "@/lib/budget-queries";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type BudgetSectionFormModalProps = {
  open: boolean;
  scope: BudgetScope;
  onOpenChange: (open: boolean) => void;
};

export function BudgetSectionFormModal({ open, scope, onOpenChange }: BudgetSectionFormModalProps) {
  const [name, setName] = useState("");
  const scopeLabel = scope === "MONTHLY" ? "monthly" : "annual";

  const [createSection, { loading }] = useMutation(CREATE_BUDGET_SECTION_MUTATION, {
    refetchQueries: [...BUDGET_PAGE_REFETCH],
    onCompleted: () => onOpenChange(false),
  });

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    await createSection({ variables: { name: trimmed, scope } });
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Add ${scopeLabel} section`}
      className="w-[min(100%-2rem,28rem)]"
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-text-main">Section name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={scope === "MONTHLY" ? "Food" : "Insurance"}
            autoFocus
            className="w-full rounded-md border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Adding…" : "Add section"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
