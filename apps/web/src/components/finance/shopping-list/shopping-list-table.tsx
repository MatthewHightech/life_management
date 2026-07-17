import {
  EditableTable,
  EditableTableBody,
  EditableTableHead,
  EditableTableHeaderCell,
} from "@/components/editable-table";
import {
  ShoppingListRow,
  type ShoppingItem,
} from "@/components/finance/shopping-list/shopping-list-row";
import type { UpdateShoppingItemInput } from "@/graphql";

type ShoppingListTableProps = {
  items: ShoppingItem[];
  emptyMessage: string;
  onUpdate: (id: string, input: UpdateShoppingItemInput) => Promise<void>;
  onSetPurchased: (id: string, purchased: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function ShoppingListTable({
  items,
  emptyMessage,
  onUpdate,
  onSetPurchased,
  onDelete,
}: ShoppingListTableProps) {
  return (
    <EditableTable className="min-w-[44rem]">
      <colgroup>
        <col />
        <col className="w-36" />
        <col className="w-36" />
        <col className="w-28" />
        <col className="w-28" />
      </colgroup>
      <EditableTableHead>
        <tr>
          <EditableTableHeaderCell className="px-4">Item</EditableTableHeaderCell>
          <EditableTableHeaderCell className="px-4 text-right">Budget</EditableTableHeaderCell>
          <EditableTableHeaderCell className="px-4">Urgency</EditableTableHeaderCell>
          <EditableTableHeaderCell className="px-4">Added by</EditableTableHeaderCell>
          <EditableTableHeaderCell className="px-4" />
        </tr>
      </EditableTableHead>
      <EditableTableBody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-4 py-6 text-center text-sm text-text-muted">
              {emptyMessage}
            </td>
          </tr>
        ) : null}
        {items.map((item) => (
          <ShoppingListRow
            key={item.id}
            item={item}
            onUpdate={onUpdate}
            onSetPurchased={onSetPurchased}
            onDelete={onDelete}
          />
        ))}
      </EditableTableBody>
    </EditableTable>
  );
}
