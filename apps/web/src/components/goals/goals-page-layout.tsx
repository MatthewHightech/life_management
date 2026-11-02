"use client";

import { GoalsViewToggle } from "@/components/goals/goals-view-toggle";
import { ModulePageLayout } from "@/components/shell/module-page-layout";

type GoalsPageLayoutProps = {
  children: React.ReactNode;
};

export function GoalsPageLayout({ children }: GoalsPageLayoutProps) {
  return (
    <ModulePageLayout title="Goals" headerExtra={<GoalsViewToggle />}>
      {children}
    </ModulePageLayout>
  );
}
