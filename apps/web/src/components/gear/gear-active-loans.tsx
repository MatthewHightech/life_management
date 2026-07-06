"use client";

import type { GearLendingQuery } from "@/graphql";
import { GearPhotoThumb } from "@/components/gear/gear-photo-thumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type GearLoan = GearLendingQuery["gearLending"]["activeLoans"][number];

type GearActiveLoansProps = {
  loans: GearLoan[];
  returningId: string | null;
  onReturn: (loanId: string) => void;
};

export function GearActiveLoans({ loans, returningId, onReturn }: GearActiveLoansProps) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface">
      <header className="border-b border-border-subtle bg-muted-blue/30 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">Active loans</h2>
      </header>

      <div className="overflow-x-auto p-3">
        {loans.length === 0 ? (
          <p className="text-sm text-text-muted">No gear is currently out on loan.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-2 py-2">Borrower</th>
                <th className="px-2 py-2">Items</th>
                <th className="px-2 py-2">Lent</th>
                <th className="px-2 py-2">Return by</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr
                  key={loan.id}
                  className={cn(
                    "border-t border-border-subtle",
                    loan.isOverdue && "bg-error/5",
                  )}
                >
                  <td className="px-2 py-2 align-top">
                    <p className="font-medium text-text-main">{loan.borrowerName}</p>
                    <p className="text-xs text-text-muted">{loan.borrowerEmail}</p>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <ul className="space-y-1">
                      {loan.items.map((item) => {
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
                  </td>
                  <td className="px-2 py-2 align-top text-text-muted">{loan.lentAt}</td>
                  <td
                    className={cn(
                      "px-2 py-2 align-top",
                      loan.isOverdue ? "font-semibold text-error" : "text-text-muted",
                    )}
                  >
                    {loan.returnBy}
                  </td>
                  <td className="px-2 py-2 align-top">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs"
                      disabled={returningId === loan.id}
                      onClick={() => onReturn(loan.id)}
                    >
                      {returningId === loan.id ? "Returning…" : "Mark returned"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
