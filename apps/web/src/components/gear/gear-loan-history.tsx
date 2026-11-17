"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { GearLoanTable, type GearLoan } from "@/components/gear/gear-loan-table";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { sectionCardClass, sectionHeaderClass } from "@/lib/section-header";
import { formatLongDate } from "@life/shared";
import { cn } from "@/lib/cn";

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
        <GearLoanTable
          loans={loans}
          emptyMessage="Returned loans will appear here."
          lastColumn={{
            header: "Returned",
            className: "text-text-muted",
            render: (loan) => (loan.returnedAt ? formatLongDate(loan.returnedAt) : "—"),
          }}
        />
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
