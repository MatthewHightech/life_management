"use client";

import { GearLoanTable, type GearLoan } from "@/components/gear/gear-loan-table";
import { Button } from "@/components/ui/button";
import { sectionCardClass, sectionHeaderClass } from "@/lib/section-header";

type GearActiveLoansProps = {
  loans: GearLoan[];
  returningId: string | null;
  onReturn: (loanId: string) => void;
};

export function GearActiveLoans({ loans, returningId, onReturn }: GearActiveLoansProps) {
  return (
    <section className={sectionCardClass}>
      <header className={sectionHeaderClass}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-main">Active loans</h2>
      </header>

      <GearLoanTable
        loans={loans}
        emptyMessage="No gear is currently out on loan."
        highlightOverdue
        lastColumn={{
          header: "Actions",
          render: (loan) => (
            <Button
              type="button"
              variant="secondary"
              className="whitespace-nowrap px-3 py-1.5 text-xs"
              disabled={returningId === loan.id}
              onClick={() => onReturn(loan.id)}
            >
              {returningId === loan.id ? "Returning…" : "Mark returned"}
            </Button>
          ),
        }}
      />
    </section>
  );
}
