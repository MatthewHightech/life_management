export const BUDGET_TIMEZONE = "America/Los_Angeles";

export function getPurchaseBudgetYearMonth(reference: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUDGET_TIMEZONE,
    year: "numeric",
    month: "numeric",
  }).formatToParts(reference);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
  };
}

export function getBudgetCalendarPeriod(reference = new Date()) {
  const { year, month } = getPurchaseBudgetYearMonth(reference);
  const monthName = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUDGET_TIMEZONE,
    month: "long",
  }).format(reference);

  return {
    year,
    month,
    title: `${monthName} Budget`,
    annualTitle: `${year} Annual Budget`,
  };
}

export function formatCadCents(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function parseCadInputToCents(value: string): number | null {
  const normalized = value.replace(/[,\s]/g, "").replace(/^\$/, "");
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    return null;
  }

  return Math.round(Number(normalized) * 100);
}

export function budgetRemainingPercent(spentCents: number, budgetCents: number): number {
  if (budgetCents <= 0) {
    return spentCents > 0 ? 0 : 100;
  }

  const remaining = budgetCents - spentCents;
  if (remaining <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((remaining / budgetCents) * 100));
}

export function budgetRemainingCents(budgetCents: number, spentCents: number): number {
  return budgetCents - spentCents;
}

export function formatBudgetRemainingLabel(budgetCents: number, spentCents: number): string {
  const remaining = budgetRemainingCents(budgetCents, spentCents);
  if (remaining < 0) {
    return `${formatCadCents(-remaining)} over budget`;
  }
  return formatCadCents(remaining);
}
