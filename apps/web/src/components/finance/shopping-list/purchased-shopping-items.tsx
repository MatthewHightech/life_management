"use client";

import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  ShoppingListTable,
} from "@/components/finance/shopping-list/shopping-list-table";
import type { ShoppingItem } from "@/components/finance/shopping-list/shopping-list-row";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { UpdateShoppingItemInput } from "@/graphql";
import { sectionCardClass } from "@/lib/section-header";

type PurchasedShoppingItemsProps = {
  items: ShoppingItem[];
  clearing: boolean;
  onUpdate: (id: string, input: UpdateShoppingItemInput) => Promise<void>;
  onSetPurchased: (id: string, purchased: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClear: () => Promise<void>;
};

export function PurchasedShoppingItems({
  items,
  clearing,
  onUpdate,
  onSetPurchased,
  onDelete,
  onClear,
}: PurchasedShoppingItemsProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <section className={sectionCardClass}>
      <div className="flex items-center border-b border-border-subtle bg-background">
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          className="flex flex-1 items-center gap-2 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-text-muted"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span>Purchased</span>
          <span className="rounded-full bg-surface px-2 py-0.5">{items.length}</span>
        </button>
        {items.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            className="mr-2 gap-1.5 px-2 py-1 text-xs text-text-muted hover:text-error"
            onClick={() => setConfirmClear(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear purchased
          </Button>
        ) : null}
      </div>

      {!collapsed ? (
        <ShoppingListTable
          items={items}
          emptyMessage="No purchased items."
          onUpdate={onUpdate}
          onSetPurchased={onSetPurchased}
          onDelete={onDelete}
        />
      ) : null}

      <ConfirmModal
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Clear all purchased items?"
        description="This permanently deletes purchased items and their comments."
        confirmLabel="Clear purchased"
        loadingLabel="Clearing…"
        loading={clearing}
        destructive
        onConfirm={async () => {
          await onClear();
          setConfirmClear(false);
        }}
      />
    </section>
  );
}
