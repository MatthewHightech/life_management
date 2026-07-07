"use client";

import { useQuery } from "@apollo/client";
import { useState } from "react";
import type { BudgetMonthQuery } from "@/graphql";
import { BUDGET_MONTH_QUERY } from "@/graphql";
import {
  BUDGET_TABLE_CONFIGS,
  budgetSectionsForScope,
  budgetTitleForScope,
  type BudgetScope,
} from "@/components/finance/budget-scope";
import { BudgetSectionFormModal } from "@/components/finance/budget-section-form-modal";
import { BudgetTable } from "@/components/finance/budget-table";
import { FinancePageLayout } from "@/components/finance/finance-page-layout";

export function BudgetPage() {
  const [sectionModalScope, setSectionModalScope] = useState<BudgetScope | null>(null);
  const { data, loading, error } = useQuery<BudgetMonthQuery>(BUDGET_MONTH_QUERY);

  return (
    <FinancePageLayout>
      {loading && <p className="text-sm text-text-muted">Loading budget…</p>}
      {error && <p className="text-sm text-error">Could not load budget: {error.message}</p>}

      {!loading && !error && data?.budgetMonth ? (
        <div className="space-y-4">
          {BUDGET_TABLE_CONFIGS.map((config) => (
            <BudgetTable
              key={config.scope}
              title={budgetTitleForScope(data.budgetMonth, config.scope)}
              sections={budgetSectionsForScope(data.budgetMonth, config.scope)}
              collapsible={config.collapsible}
              defaultCollapsed={config.defaultCollapsed}
              emptyMessage={config.emptyMessage}
              onAddSection={() => setSectionModalScope(config.scope)}
            />
          ))}
        </div>
      ) : null}

      <BudgetSectionFormModal
        open={sectionModalScope !== null}
        scope={sectionModalScope ?? "MONTHLY"}
        onOpenChange={(open) => {
          if (!open) {
            setSectionModalScope(null);
          }
        }}
      />
    </FinancePageLayout>
  );
}
