"use client";

import { useMutation } from "@apollo/client";
import { FormEvent, useState } from "react";
import {
  ADD_GROCERY_ITEM_MUTATION,
  DELETE_GROCERY_ITEM_MUTATION,
  REMOVE_BOUGHT_GROCERY_ITEMS_MUTATION,
  UPDATE_GROCERY_ITEM_MUTATION,
} from "@/graphql";
import type { GroceryItem } from "@/components/meals/types";
import { MEAL_PLAN_REFETCH } from "@/lib/meal-plan-queries";
import { Button } from "@/components/ui/button";
import { sectionCardClass, sectionHeaderClass } from "@/lib/section-header";
import { cn } from "@/lib/cn";

type GroceryListSectionProps = {
  items: GroceryItem[];
};

export function GroceryListSection({ items }: GroceryListSectionProps) {
  const [name, setName] = useState("");
  const [quantityLabel, setQuantityLabel] = useState("");

  const mutationOptions = { refetchQueries: [...MEAL_PLAN_REFETCH] };

  const [addItem, { loading: adding }] = useMutation(ADD_GROCERY_ITEM_MUTATION, mutationOptions);
  const [updateItem] = useMutation(UPDATE_GROCERY_ITEM_MUTATION, mutationOptions);
  const [deleteItem] = useMutation(DELETE_GROCERY_ITEM_MUTATION, mutationOptions);
  const [removeBought, { loading: removingBought }] = useMutation(
    REMOVE_BOUGHT_GROCERY_ITEMS_MUTATION,
    mutationOptions,
  );

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    await addItem({
      variables: {
        input: {
          name: name.trim(),
          quantityLabel: quantityLabel.trim() || null,
        },
      },
    });

    setName("");
    setQuantityLabel("");
  }

  return (
    <section className={sectionCardClass}>
      <header className={cn(sectionHeaderClass, "flex flex-wrap items-center justify-between gap-3")}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">Grocery list</h2>
        <Button
          type="button"
          variant="ghost"
          disabled={removingBought || !items.some((item) => item.isBought)}
          onClick={() => void removeBought()}
          className="px-3 py-1.5 text-xs"
        >
          Remove bought items
        </Button>
      </header>

      <div className="space-y-2 p-3">
        {items.length === 0 ? (
          <p className="text-sm text-text-muted">Assign meals to the weekly plan to build your grocery list.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-border-subtle px-3 py-2",
                item.isBought && "bg-background/80",
              )}
            >
              <input
                type="checkbox"
                checked={item.isBought}
                onChange={(event) =>
                  void updateItem({
                    variables: { id: item.id, input: { isBought: event.target.checked } },
                  })
                }
                aria-label={`Mark ${item.name} bought`}
              />
              <div className={cn("min-w-0 flex-1", item.isBought && "text-text-muted line-through")}>
                <p className="text-sm font-medium text-text-main">{item.name}</p>
                {item.quantityLabel ? (
                  <p className="text-xs text-text-muted">{item.quantityLabel}</p>
                ) : null}
              </div>
              {item.isManual ? (
                <button
                  type="button"
                  onClick={() => void deleteItem({ variables: { id: item.id } })}
                  className="text-xs text-text-muted hover:text-error"
                >
                  Delete
                </button>
              ) : null}
            </div>
          ))
        )}

        <form onSubmit={(event) => void handleAdd(event)} className="grid grid-cols-[1fr_8rem_auto] gap-2 pt-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Add item"
            className="min-h-10 rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={quantityLabel}
            onChange={(event) => setQuantityLabel(event.target.value)}
            placeholder="Qty"
            className="min-h-10 rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <Button type="submit" disabled={adding || !name.trim()} className="px-3 py-1.5 text-xs">
            Add
          </Button>
        </form>
      </div>
    </section>
  );
}
