import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type EditableTableProps = {
  children: React.ReactNode;
  className?: string;
};

export function EditableTable({ children, className }: EditableTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-border-subtle">
      <table className={cn("w-full table-fixed text-left text-sm", className)}>{children}</table>
    </div>
  );
}

export function EditableTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-background text-xs uppercase tracking-wide text-text-muted">{children}</thead>
  );
}

export function EditableTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

type EditableTableRowProps = React.ComponentPropsWithoutRef<"tr">;

export const EditableTableRow = forwardRef<HTMLTableRowElement, EditableTableRowProps>(
  function EditableTableRow({ children, className, ...props }, ref) {
    return (
      <tr ref={ref} className={cn("border-b border-border-subtle last:border-b-0", className)} {...props}>
        {children}
      </tr>
    );
  },
);

type EditableTableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

export function EditableTableCell({ children, className, ...props }: EditableTableCellProps) {
  return (
    <td className={cn("max-w-0 overflow-hidden px-2 py-1.5 align-middle", className)} {...props}>
      {children}
    </td>
  );
}

export function EditableTableHeaderCell({ children, className, ...props }: EditableTableCellProps) {
  return (
    <th className={cn("max-w-0 overflow-hidden px-2 py-2 font-semibold", className)} {...props}>
      {children}
    </th>
  );
}
