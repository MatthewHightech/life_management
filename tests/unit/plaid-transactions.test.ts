import { describe, expect, it } from "vitest";
import {
  isCreditCardAccount,
  isImportableCreditPurchase,
  toBudgetPurchaseDraft,
} from "../../packages/plaid/src/transactions";

describe("plaid transaction filters", () => {
  it("detects credit card accounts", () => {
    expect(isCreditCardAccount({ type: "credit", subtype: "credit card" })).toBe(true);
    expect(isCreditCardAccount({ type: "depository", subtype: "checking" })).toBe(false);
  });

  it("imports posted current-month purchases only", () => {
    const purchase = {
      transaction_id: "txn_1",
      account_id: "acc_1",
      name: "GROCERY STORE",
      merchant_name: "Grocery Store",
      amount: 42.5,
      date: "2026-07-05",
      pending: false,
      personal_finance_category: { primary: "GENERAL_MERCHANDISE" },
    };

    expect(isImportableCreditPurchase(purchase, 2026, 7)).toBe(true);
    expect(isImportableCreditPurchase({ ...purchase, pending: true }, 2026, 7)).toBe(false);
    expect(isImportableCreditPurchase({ ...purchase, amount: -10 }, 2026, 7)).toBe(false);
    expect(isImportableCreditPurchase(purchase, 2026, 6)).toBe(false);
  });

  it("excludes payments, transfers, and interest", () => {
    const base = {
      transaction_id: "txn_2",
      account_id: "acc_1",
      amount: 100,
      date: "2026-07-05",
      pending: false,
      personal_finance_category: { primary: "LOAN_PAYMENTS" },
      name: "AUTOPAY PAYMENT - THANK YOU",
    };

    expect(isImportableCreditPurchase(base, 2026, 7)).toBe(false);
    expect(
      isImportableCreditPurchase(
        {
          ...base,
          personal_finance_category: { primary: "INTEREST" },
          name: "INTEREST CHARGE",
        },
        2026,
        7,
      ),
    ).toBe(false);
  });

  it("maps drafts to budget purchase fields", () => {
    expect(
      toBudgetPurchaseDraft({
        transaction_id: "txn_3",
        account_id: "acc_1",
        name: "RAW NAME",
        merchant_name: "Merchant",
        amount: 12.34,
        date: "2026-07-08",
        pending: false,
      }),
    ).toEqual({
      name: "Merchant",
      amountCents: 1234,
      purchaseDate: "2026-07-08",
      externalTransactionId: "txn_3",
    });
  });
});
