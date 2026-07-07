import { FinancePageLayout } from "@/components/finance/finance-page-layout";

type FinancePlaceholderPageProps = {
  message: string;
};

export function FinancePlaceholderPage({ message }: FinancePlaceholderPageProps) {
  return (
    <FinancePageLayout>
      <p className="text-sm text-text-muted">{message}</p>
    </FinancePageLayout>
  );
}
