import { ModuleRouteShell } from "@/components/shell/module-route-shell";
import { MealsPageLayout } from "@/components/meals/meals-page-layout";

export default function MealsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleRouteShell>
      <MealsPageLayout>{children}</MealsPageLayout>
    </ModuleRouteShell>
  );
}
