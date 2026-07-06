"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { GearLendingQuery } from "@/graphql";
import { GearPhotoThumb } from "@/components/gear/gear-photo-thumb";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

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
    <section className="rounded-xl border border-border-subtle bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-muted-blue/20 px-4 py-3">
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
                              <span>{item.displayName}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                    <td className="px-2 py-2 align-top text-text-muted">{loan.lentAt}</td>
                    <td className="px-2 py-2 align-top text-text-muted">{loan.returnBy}</td>
                    <td className="px-2 py-2 align-top text-text-muted">
                      {loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Clear loan history?"
        description="This permanently deletes all returned loan records. Active loans are not affected."
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-error text-white hover:bg-error/90"
            disabled={clearing}
            onClick={() => {
              void onClearHistory().then(() => setConfirmOpen(false));
            }}
          >
            {clearing ? "Clearing…" : "Clear history"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
