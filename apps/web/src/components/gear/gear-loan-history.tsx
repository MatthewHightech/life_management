"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { GearLendingQuery } from "@/graphql";
import { GearLoanItemList } from "@/components/gear/gear-loan-item-list";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { sectionCardClass, sectionHeaderClass } from "@/lib/section-header";
import { formatLongDate } from "@life/shared";
import { cn } from "@/lib/cn";

type GearLoan = GearLendingQuery["gearLending"]["loanHistory"][number];

type GearLoanHistoryProps = {
  loans: GearLoan[];
  clearing: boolean;
  onClearHistory: () => Promise<void>;
};

export function GearLoanHistory({ loans, clearing, onClearHistory }: GearLoanHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <section className={sectionCardClass}>
      <header className={cn(sectionHeaderClass, "flex flex-wrap items-center justify-between gap-2")}>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-main"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Loan history ({loans.length})
        </button>
        {expanded && loans.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            className="text-xs text-error hover:text-error"
            onClick={() => setConfirmOpen(true)}
          >
            Clear history
          </Button>
        ) : null}
      </header>

      {expanded ? (
        <div className="overflow-x-auto p-3">
          {loans.length === 0 ? (
            <p className="text-sm text-text-muted">Returned loans will appear here.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-2 py-2">Borrower</th>
                  <th className="px-2 py-2">Items</th>
                  <th className="px-2 py-2">Lent</th>
                  <th className="px-2 py-2">Return by</th>
                  <th className="px-2 py-2">Returned</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-t border-border-subtle">
                    <td className="px-2 py-2 align-top">
                      <p className="font-medium text-text-main">{loan.borrowerName}</p>
                      <p className="text-xs text-text-muted">{loan.borrowerEmail}</p>
                    </td>
                    <td className="px-2 py-2 align-top">
                      <GearLoanItemList items={loan.items} />
                    </td>
                    <td className="px-2 py-2 align-top text-text-muted">
                      {formatLongDate(loan.lentAt)}
                    </td>
                    <td className="px-2 py-2 align-top text-text-muted">
                      {formatLongDate(loan.returnBy)}
                    </td>
                    <td className="px-2 py-2 align-top text-text-muted">
                      {loan.returnedAt ? formatLongDate(loan.returnedAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Clear loan history?"
        description="This permanently deletes all returned loan records. Active loans are not affected."
        confirmLabel="Clear history"
        loadingLabel="Clearing…"
        loading={clearing}
        destructive
        onConfirm={async () => {
          await onClearHistory();
          setConfirmOpen(false);
        }}
      />
    </section>
  );
}
