import {
  EditableTable,
  EditableTableBody,
  EditableTableHead,
  EditableTableHeaderCell,
} from "@/components/editable-table";
import {
  ShoppingListRow,
  type ShoppingItem,
  type ShoppingItemActions,
} from "@/components/finance/shopping-list/shopping-list-row";

type ShoppingListTableProps = ShoppingItemActions & {
  items: ShoppingItem[];
  emptyMessage: string;
};

export function ShoppingListTable({ items, emptyMessage, ...actions }: ShoppingListTableProps) {
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
          <ShoppingListRow key={item.id} item={item} {...actions} />
        ))}
      </EditableTableBody>
    </EditableTable>
  );
}
