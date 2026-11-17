import type { ReactNode } from "react";
import type { GearLendingQuery } from "@/graphql";
import { GearPhotoThumb } from "@/components/gear/gear-photo-thumb";
import { formatLongDate } from "@life/shared";
import { cn } from "@/lib/cn";

export type GearLoan = GearLendingQuery["gearLending"]["activeLoans"][number];

function GearLoanItemList({ items }: { items: GearLoan["items"] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const kind = item.gearItem ? "item" : "variant";
        const id = item.gearItem?.id ?? item.gearVariant?.id;
        if (!id) {
          return null;
        }
        return (
          <li key={item.id} className="flex items-center gap-2">
            <GearPhotoThumb
              kind={kind}
              id={id}
              hasPhoto={item.hasPhoto}
              alt={item.displayName}
              className="h-8 w-8"
            />
            <span className="text-text-main">{item.displayName}</span>
          </li>
        );
      })}
    </ul>
  );
}

type GearLoanTableProps = {
  loans: GearLoan[];
  emptyMessage: string;
  highlightOverdue?: boolean;
  lastColumn: {
    header: string;
    className?: string;
    render: (loan: GearLoan) => ReactNode;
  };
};

export function GearLoanTable({ loans, emptyMessage, highlightOverdue = false, lastColumn }: GearLoanTableProps) {
  return (
    <div className="overflow-x-auto p-3">
      {loans.length === 0 ? (
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      ) : (
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-2 py-2">Borrower</th>
              <th className="px-2 py-2">Items</th>
              <th className="px-2 py-2">Lent</th>
              <th className="px-2 py-2">Return by</th>
              <th className="px-2 py-2">{lastColumn.header}</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const overdue = highlightOverdue && loan.isOverdue;
              return (
                <tr key={loan.id} className={cn("border-t border-border-subtle", overdue && "bg-error/5")}>
                  <td className="px-2 py-2 align-top">
                    <p className="font-medium text-text-main">{loan.borrowerName}</p>
                    <p className="text-xs text-text-muted">{loan.borrowerEmail}</p>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <GearLoanItemList items={loan.items} />
                  </td>
                  <td className="px-2 py-2 align-top text-text-muted">{formatLongDate(loan.lentAt)}</td>
                  <td
                    className={cn(
                      "px-2 py-2 align-top",
                      overdue ? "font-semibold text-error" : "text-text-muted",
                    )}
                  >
                    {formatLongDate(loan.returnBy)}
                  </td>
                  <td className={cn("px-2 py-2 align-top", lastColumn.className)}>{lastColumn.render(loan)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
