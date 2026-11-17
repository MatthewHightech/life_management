"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";
import { CommentsProvider } from "@/components/comments/comments-context";
import { FinancePageLayout } from "@/components/finance/finance-page-layout";
import { PurchasedShoppingItems } from "@/components/finance/shopping-list/purchased-shopping-items";
import { QuickAddShoppingItem } from "@/components/finance/shopping-list/quick-add-shopping-item";
import { ShoppingCommentsSidebar } from "@/components/finance/shopping-list/shopping-comments-sidebar";
import type { ShoppingItemActions } from "@/components/finance/shopping-list/shopping-list-row";
import { ShoppingListTable } from "@/components/finance/shopping-list/shopping-list-table";
import {
  ClearPurchasedShoppingItemsDocument,
  DeleteShoppingItemDocument,
  SetShoppingItemPurchasedDocument,
  ShoppingListDocument,
  UpdateShoppingItemDocument,
  type ShoppingListQuery,
} from "@/graphql";

const refetchOptions = {
  refetchQueries: [{ query: ShoppingListDocument }],
  awaitRefetchQueries: true,
};

export function ShoppingListPage() {
  const { data, loading, error } = useQuery<ShoppingListQuery>(ShoppingListDocument);
  const [updateItem] = useMutation(UpdateShoppingItemDocument, refetchOptions);
  const [setPurchased] = useMutation(
    SetShoppingItemPurchasedDocument,
    refetchOptions,
  );
  const [deleteItem] = useMutation(DeleteShoppingItemDocument, refetchOptions);
  const [clearPurchased, { loading: clearing }] = useMutation(
    ClearPurchasedShoppingItemsDocument,
    refetchOptions,
  );

  const { activeItems, purchasedItems } = useMemo(() => {
    const items = data?.shoppingItems ?? [];
    return {
      activeItems: items.filter((item) => !item.purchasedAt),
      purchasedItems: items
        .filter((item) => item.purchasedAt)
        .sort((a, b) => (b.purchasedAt ?? "").localeCompare(a.purchasedAt ?? "")),
    };
  }, [data?.shoppingItems]);

  const actions: ShoppingItemActions = {
    onUpdate: async (id, input) => {
      await updateItem({ variables: { id, input } });
    },
    onSetPurchased: async (id, purchased) => {
      await setPurchased({ variables: { id, purchased } });
    },
    onDelete: async (id) => {
      await deleteItem({ variables: { id } });
    },
  };

  return (
    <CommentsProvider>
      <FinancePageLayout>
        {loading ? <p className="text-sm text-text-muted">Loading shopping list…</p> : null}
        {error ? <p className="text-sm text-error">Could not load shopping list: {error.message}</p> : null}

        {!loading && !error ? (
          <div className="space-y-5">
            <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
              <QuickAddShoppingItem currentUser={data?.me} />
            </div>

            <ShoppingListTable items={activeItems} emptyMessage="No shopping items yet." {...actions} />

            <PurchasedShoppingItems
              items={purchasedItems}
              clearing={clearing}
              {...actions}
              onClear={async () => {
                await clearPurchased();
              }}
            />
          </div>
        ) : null}
      </FinancePageLayout>
      <ShoppingCommentsSidebar />
    </CommentsProvider>
  );
}
