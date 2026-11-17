"use client";

import { useMutation } from "@apollo/client";
import { useBudgetDraftFields } from "@/components/finance/budget/use-budget-draft-fields";
import { CreateBudgetLineItemDocument } from "@/graphql";
import { BUDGET_PAGE_REFETCH } from "@/lib/refetch-queries";

type BudgetLineDraftRowProps = {
  sectionId: string;
  onCreated: () => void;
  onCancel: () => void;
};

export function BudgetLineDraftRow({ sectionId, onCreated, onCancel }: BudgetLineDraftRowProps) {
  const [createLineItem, { loading }] = useMutation(CreateBudgetLineItemDocument, {
    refetchQueries: [...BUDGET_PAGE_REFETCH],
    awaitRefetchQueries: true,
  });

  const { rowRef, nameInputProps, amountInputProps } = useBudgetDraftFields<HTMLTableRowElement>({
    namePlaceholder: "Item name",
    disabled: loading,
    onCancel,
    onSubmit: async ({ name, amountCents }) => {
      await createLineItem({ variables: { input: { sectionId, name, amountCents } } });
      onCreated();
    },
  });

  return (
    <tr ref={rowRef} className="border-b border-border-subtle bg-background/80">
      <td className="max-w-0 overflow-hidden px-3 py-1.5 pl-10">
        <input {...nameInputProps} />
      </td>
      <td className="px-3 py-1.5">
        <input {...amountInputProps} />
      </td>
      <td className="px-3 py-1.5" />
      <td className="px-3 py-1.5" />
      <td className="px-3 py-1.5" />
      <td className="px-3 py-1.5" />
    </tr>
  );
}
