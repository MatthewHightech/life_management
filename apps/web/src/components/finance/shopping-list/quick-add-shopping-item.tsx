"use client";

import { useMutation } from "@apollo/client";
import { Plus } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { EditableUrgency } from "@/components/finance/shopping-list/editable-urgency";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CreateShoppingItemDocument,
  ShoppingListDocument,
  type ShoppingListQuery,
  type ShoppingUrgency,
} from "@/graphql";
import { parseCadInputToCents } from "@life/shared";
import { inlineFieldInputClass } from "@/lib/inline-edit-styles";
import { cn } from "@/lib/cn";

const DEFAULT_URGENCY: ShoppingUrgency = "MEDIUM";
const CELL = "flex min-h-10 min-w-0 items-center px-4 py-1.5";

type QuickAddShoppingItemProps = {
  currentUser: ShoppingListQuery["me"];
};

export function QuickAddShoppingItem({
  currentUser,
}: QuickAddShoppingItemProps) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [urgency, setUrgency] = useState<ShoppingUrgency>(DEFAULT_URGENCY);
  const [nameError, setNameError] = useState(false);
  const [budgetError, setBudgetError] = useState(false);
  const [createItem, { loading }] = useMutation(CreateShoppingItemDocument, {
    refetchQueries: [{ query: ShoppingListDocument }],
  });

  async function handleAdd() {
    const trimmedName = name.trim();
    const budgetCents = budget.trim() ? parseCadInputToCents(budget) : null;
    const budgetInvalid = Boolean(budget.trim()) && budgetCents === null;
    setNameError(!trimmedName);
    setBudgetError(budgetInvalid);
    if (!trimmedName || budgetInvalid) {
      return;
    }

    await createItem({
      variables: {
        input: {
          name: trimmedName,
          urgency,
          ...(budgetCents == null ? {} : { budgetCents }),
        },
      },
    });
    setName("");
    setBudget("");
    setUrgency(DEFAULT_URGENCY);
  }

  function submitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleAdd();
    }
  }

  return (
    <div className="grid min-w-[44rem] grid-cols-[minmax(15rem,1fr)_9rem_9rem_7rem_8rem]">
      <div className={CELL}>
        <div className="w-full space-y-1">
          <input
            value={name}
            disabled={loading}
            placeholder="Item name"
            onChange={(event) => {
              setName(event.target.value);
              if (event.target.value.trim()) {
                setNameError(false);
              }
            }}
            onKeyDown={submitOnEnter}
            className={cn(
              inlineFieldInputClass,
              "font-medium",
              nameError && "border-error focus:border-error",
            )}
          />
          {nameError ? <p className="text-xs text-error">Item name is required.</p> : null}
        </div>
      </div>

      <div className={CELL}>
        <div className="w-full space-y-1">
          <input
            value={budget}
            disabled={loading}
            inputMode="decimal"
            placeholder="—"
            aria-label="Estimated budget"
            onChange={(event) => {
              setBudget(event.target.value);
              setBudgetError(false);
            }}
            onKeyDown={submitOnEnter}
            className={cn(
              inlineFieldInputClass,
              "text-right tabular-nums",
              budgetError && "border-error focus:border-error",
            )}
          />
          {budgetError ? <p className="text-xs text-error">Enter a valid amount.</p> : null}
        </div>
      </div>

      <div className={CELL}>
        <EditableUrgency value={urgency} onSave={setUrgency} />
      </div>

      <div className={CELL}>
        {currentUser ? (
          <Avatar
            name={currentUser.name}
            email={currentUser.email}
            image={currentUser.image}
          />
        ) : null}
      </div>

      <div className={cn(CELL, "justify-end")}>
        <Button
          type="button"
          disabled={loading}
          onClick={() => void handleAdd()}
          className="gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs"
        >
          <Plus className="h-4 w-4" />
          {loading ? "Adding…" : "Add item"}
        </Button>
      </div>
    </div>
  );
}
