import { getPurchaseBudgetYearMonth } from "@life/shared";

export type PlaidTransactionLike = {
  transaction_id: string;
  account_id: string;
  name: string;
  merchant_name?: string | null;
  amount: number;
  date: string;
  pending: boolean;
  personal_finance_category?: {
    primary?: string | null;
    detailed?: string | null;
  } | null;
};

const EXCLUDED_PRIMARY_CATEGORIES = new Set([
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "LOAN_PAYMENTS",
  "BANK_FEES",
  "INCOME",
]);

const EXCLUDED_NAME_PATTERNS = [
  /\bpayment\b/i,
  /\bthank you\b/i,
  /\binterest\b/i,
  /\btransfer\b/i,
  /\bcash advance\b/i,
  /\bcredit card payment\b/i,
  /\bbalance transfer\b/i,
  /\bautopay\b/i,
];

export function isCreditCardAccount(account: { type: string; subtype?: string | null }) {
  const type = account.type.toLowerCase();
  const subtype = (account.subtype ?? "").toLowerCase();
  return type === "credit" || subtype.includes("credit");
}

export function isImportableCreditPurchase(
  transaction: PlaidTransactionLike,
  budgetYear: number,
  budgetMonth: number,
) {
  if (transaction.pending) {
    return false;
  }

  // Credit card purchases are positive amounts in Plaid (charges).
  if (!(transaction.amount > 0)) {
    return false;
  }

  const purchaseDate = new Date(`${transaction.date}T12:00:00.000Z`);
  const { year, month } = getPurchaseBudgetYearMonth(purchaseDate);
  if (year !== budgetYear || month !== budgetMonth) {
    return false;
  }

  const primary = transaction.personal_finance_category?.primary ?? "";
  if (EXCLUDED_PRIMARY_CATEGORIES.has(primary)) {
    return false;
  }

  const label = `${transaction.merchant_name ?? ""} ${transaction.name}`;
  if (EXCLUDED_NAME_PATTERNS.some((pattern) => pattern.test(label))) {
    return false;
  }

  return true;
}

export function toBudgetPurchaseDraft(transaction: PlaidTransactionLike) {
  return {
    name: (transaction.merchant_name ?? transaction.name).trim() || "Card purchase",
    amountCents: Math.round(transaction.amount * 100),
    purchaseDate: transaction.date,
    externalTransactionId: transaction.transaction_id,
  };
}
