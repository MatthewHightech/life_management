"use client";

import { FinanceViewToggle } from "@/components/finance/finance-view-toggle";
import { BankSettingsButton } from "@/components/finance/budget/bank-settings-button";
import { ModulePageLayout } from "@/components/shell/module-page-layout";

type FinancePageLayoutProps = {
  children: React.ReactNode;
};

export function FinancePageLayout({ children }: FinancePageLayoutProps) {
  return (
    <ModulePageLayout
      title="Finance"
      headerExtra={
        <>
          <FinanceViewToggle />
          <div className="ml-auto">
            <BankSettingsButton />
          </div>
        </>
      }
    >
      {children}
    </ModulePageLayout>
  );
}
