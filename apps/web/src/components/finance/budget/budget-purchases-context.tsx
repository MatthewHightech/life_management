"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { BudgetScope } from "@/components/finance/budget/budget-scope";

export type BudgetPurchasesTarget = {
  id: string;
  name: string;
  amountCents: number;
  spentCents: number;
  scope: BudgetScope;
};

type BudgetPurchasesContextValue = {
  activeLineItem: BudgetPurchasesTarget | null;
  openPurchases: (lineItem: BudgetPurchasesTarget) => void;
  closePurchases: () => void;
};

const BudgetPurchasesContext = createContext<BudgetPurchasesContextValue | null>(null);

export function BudgetPurchasesProvider({ children }: { children: ReactNode }) {
  const [activeLineItem, setActiveLineItem] = useState<BudgetPurchasesTarget | null>(null);

  return (
    <BudgetPurchasesContext.Provider
      value={{
        activeLineItem,
        openPurchases: setActiveLineItem,
        closePurchases: () => setActiveLineItem(null),
      }}
    >
      {children}
    </BudgetPurchasesContext.Provider>
  );
}

export function useBudgetPurchases() {
  const context = useContext(BudgetPurchasesContext);
  if (!context) {
    throw new Error("useBudgetPurchases must be used within BudgetPurchasesProvider");
  }
  return context;
}
