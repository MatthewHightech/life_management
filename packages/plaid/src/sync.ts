import type { PrismaClient } from "@prisma/client";
import { BudgetPurchaseSource } from "@prisma/client";
import { getBudgetCalendarPeriod } from "@life/shared";
import { createPlaidClient } from "./client";
import { decryptPlaidAccessToken } from "./crypto";
import {
  isCreditCardAccount,
  isImportableCreditPurchase,
  toBudgetPurchaseDraft,
  type PlaidTransactionLike,
} from "./transactions";

type SyncableConnection = {
  id: string;
  householdId: string;
  accessTokenEncrypted: string;
  syncCursor: string | null;
  accounts: {
    id: string;
    plaidAccountId: string;
    syncEnabled: boolean;
    type: string;
    subtype: string | null;
  }[];
};

export type SyncConnectionResult = {
  connectionId: string;
  importedCount: number;
  skippedCount: number;
};

export async function syncBankConnection(
  prisma: PrismaClient,
  connection: SyncableConnection,
): Promise<SyncConnectionResult> {
  const enabledAccountIds = new Set(
    connection.accounts
      .filter((account) => account.syncEnabled && isCreditCardAccount(account))
      .map((account) => account.plaidAccountId),
  );

  if (enabledAccountIds.size === 0) {
    await prisma.bankConnection.update({
      where: { id: connection.id },
      data: { lastSyncedAt: new Date(), lastError: null, status: "ACTIVE" },
    });
    return { connectionId: connection.id, importedCount: 0, skippedCount: 0 };
  }

  const client = createPlaidClient();
  const accessToken = decryptPlaidAccessToken(connection.accessTokenEncrypted);
  const period = getBudgetCalendarPeriod();

  let cursor = connection.syncCursor ?? undefined;
  let importedCount = 0;
  let skippedCount = 0;
  let hasMore = true;
  let nextCursor: string | null = connection.syncCursor;

  try {
    while (hasMore) {
      const response = await client.transactionsSync({
        access_token: accessToken,
        cursor,
        count: 500,
      });

      const added = response.data.added as PlaidTransactionLike[];
      const modified = response.data.modified as PlaidTransactionLike[];
      const removed = response.data.removed;

      for (const transaction of [...added, ...modified]) {
        if (!enabledAccountIds.has(transaction.account_id)) {
          skippedCount += 1;
          continue;
        }

        if (!isImportableCreditPurchase(transaction, period.year, period.month)) {
          skippedCount += 1;
          continue;
        }

        const draft = toBudgetPurchaseDraft(transaction);
        await prisma.budgetPurchase.upsert({
          where: {
            householdId_externalTransactionId: {
              householdId: connection.householdId,
              externalTransactionId: draft.externalTransactionId,
            },
          },
          create: {
            householdId: connection.householdId,
            name: draft.name,
            amountCents: draft.amountCents,
            purchaseDate: new Date(`${draft.purchaseDate}T12:00:00.000Z`),
            source: BudgetPurchaseSource.VISA,
            externalTransactionId: draft.externalTransactionId,
          },
          update: {
            name: draft.name,
            amountCents: draft.amountCents,
            purchaseDate: new Date(`${draft.purchaseDate}T12:00:00.000Z`),
          },
        });
        importedCount += 1;
      }

      // Removed transactions: leave assigned purchases alone; delete only unassigned VISA rows.
      for (const removedTxn of removed) {
        if (!removedTxn.transaction_id) {
          continue;
        }
        const existing = await prisma.budgetPurchase.findUnique({
          where: {
            householdId_externalTransactionId: {
              householdId: connection.householdId,
              externalTransactionId: removedTxn.transaction_id,
            },
          },
          include: { allocations: true },
        });
        if (existing && existing.source === BudgetPurchaseSource.VISA && existing.allocations.length === 0) {
          await prisma.budgetPurchase.delete({ where: { id: existing.id } });
        }
      }

      hasMore = response.data.has_more;
      nextCursor = response.data.next_cursor;
      cursor = nextCursor;
    }

    await prisma.bankConnection.update({
      where: { id: connection.id },
      data: {
        syncCursor: nextCursor,
        lastSyncedAt: new Date(),
        lastError: null,
        status: "ACTIVE",
      },
    });

    return { connectionId: connection.id, importedCount, skippedCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bank sync failed";
    await prisma.bankConnection.update({
      where: { id: connection.id },
      data: { status: "ERROR", lastError: message },
    });
    throw error;
  }
}

export async function syncAllActiveBankConnections(prisma: PrismaClient) {
  const connections = await prisma.bankConnection.findMany({
    where: { status: { in: ["ACTIVE", "PENDING_SETUP", "ERROR"] } },
    include: { accounts: true },
  });

  const results: SyncConnectionResult[] = [];
  for (const connection of connections) {
    if (connection.accounts.every((account) => !account.syncEnabled)) {
      continue;
    }
    results.push(await syncBankConnection(prisma, connection));
  }
  return results;
}
