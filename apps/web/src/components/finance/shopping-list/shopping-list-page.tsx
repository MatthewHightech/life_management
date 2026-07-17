"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";
import { CommentsProvider } from "@/components/comments/comments-context";
import { FinancePageLayout } from "@/components/finance/finance-page-layout";
import { PurchasedShoppingItems } from "@/components/finance/shopping-list/purchased-shopping-items";
import { QuickAddShoppingItem } from "@/components/finance/shopping-list/quick-add-shopping-item";
import { ShoppingCommentsSidebar } from "@/components/finance/shopping-list/shopping-comments-sidebar";
import { ShoppingListTable } from "@/components/finance/shopping-list/shopping-list-table";
import {
  CLEAR_PURCHASED_SHOPPING_ITEMS_MUTATION,
  DELETE_SHOPPING_ITEM_MUTATION,
  SET_SHOPPING_ITEM_PURCHASED_MUTATION,
  SHOPPING_LIST_QUERY,
  UPDATE_SHOPPING_ITEM_MUTATION,
  type ShoppingListQuery,
  type UpdateShoppingItemInput,
} from "@/graphql";

const refetchOptions = {
  refetchQueries: [{ query: SHOPPING_LIST_QUERY }],
  awaitRefetchQueries: true,
};

export function ShoppingListPage() {
  const { data, loading, error } = useQuery<ShoppingListQuery>(SHOPPING_LIST_QUERY);
  const [updateItem] = useMutation(UPDATE_SHOPPING_ITEM_MUTATION, refetchOptions);
  const [setPurchased] = useMutation(
    SET_SHOPPING_ITEM_PURCHASED_MUTATION,
    refetchOptions,
  );
  const [deleteItem] = useMutation(DELETE_SHOPPING_ITEM_MUTATION, refetchOptions);
  const [clearPurchased, { loading: clearing }] = useMutation(
    CLEAR_PURCHASED_SHOPPING_ITEMS_MUTATION,
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

  const handleUpdate = useCallback(
    async (id: string, input: UpdateShoppingItemInput) => {
      await updateItem({ variables: { id, input } });
    },
    [updateItem],
  );

  const handleSetPurchased = useCallback(
    async (id: string, purchased: boolean) => {
      await setPurchased({ variables: { id, purchased } });
    },
    [setPurchased],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteItem({ variables: { id } });
    },
    [deleteItem],
  );

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

            <ShoppingListTable
              items={activeItems}
              emptyMessage="No shopping items yet."
              onUpdate={handleUpdate}
              onSetPurchased={handleSetPurchased}
              onDelete={handleDelete}
            />

            <PurchasedShoppingItems
              items={purchasedItems}
              clearing={clearing}
              onUpdate={handleUpdate}
              onSetPurchased={handleSetPurchased}
              onDelete={handleDelete}
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
