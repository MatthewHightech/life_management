"use client";

import { FinanceViewToggle } from "@/components/finance/finance-view-toggle";
import { ModulePageLayout } from "@/components/shell/module-page-layout";

type FinancePageLayoutProps = {
  children: React.ReactNode;
};

export function FinancePageLayout({ children }: FinancePageLayoutProps) {
  return (
    <ModulePageLayout title="Finance" headerExtra={<FinanceViewToggle />}>
      {children}
    </ModulePageLayout>
  );
}
