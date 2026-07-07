export const BUDGET_TIMEZONE = "America/Los_Angeles";

/** Sentinel month value for annual year-to-date spend rows. */
export const ANNUAL_SPEND_MONTH = 0;

export const BUDGET_MONTHS_PER_YEAR = 12;

export type BudgetCalendarPeriod = {
  year: number;
  month: number;
  title: string;
  annualTitle: string;
};

function getLosAngelesYearMonth(reference: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: BUDGET_TIMEZONE,
    year: "numeric",
    month: "numeric",
  });

  const parts = formatter.formatToParts(reference);
  const lookup = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
  };
}

export function getBudgetCalendarPeriod(reference = new Date()): BudgetCalendarPeriod {
  const { year, month } = getLosAngelesYearMonth(reference);
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

export function spendMonthKey(type: "MONTHLY" | "ANNUAL", year: number, month: number) {
  return type === "ANNUAL" ? ANNUAL_SPEND_MONTH : month;
}

export function monthlyPortionOfAnnualCents(annualCents: number): number {
  return Math.round(annualCents / BUDGET_MONTHS_PER_YEAR);
}

export function annualCentsFromMonthlyPortion(monthlyCents: number): number {
  return monthlyCents * BUDGET_MONTHS_PER_YEAR;
}

export function budgetLineMonthlyBudgetCents(
  amountCents: number,
  type: "MONTHLY" | "ANNUAL",
): number {
  return type === "ANNUAL" ? monthlyPortionOfAnnualCents(amountCents) : amountCents;
}

export function budgetLineMonthlySpentCents(
  spentCents: number,
  type: "MONTHLY" | "ANNUAL",
): number {
  return type === "ANNUAL" ? monthlyPortionOfAnnualCents(spentCents) : spentCents;
}

export function storedBudgetAmountCents(
  monthlyAmountCents: number,
  type: "MONTHLY" | "ANNUAL",
): number {
  return type === "ANNUAL" ? annualCentsFromMonthlyPortion(monthlyAmountCents) : monthlyAmountCents;
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
  if (!normalized) {
    return null;
  }

  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    return null;
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100);
}

export function budgetProgressPercent(spentCents: number, budgetCents: number): number {
  if (budgetCents <= 0) {
    return spentCents > 0 ? 100 : 0;
  }

  return Math.min(100, Math.round((spentCents / budgetCents) * 100));
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
