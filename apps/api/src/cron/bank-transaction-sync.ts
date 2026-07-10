import { prisma } from "@life/db";
import { syncAllActiveBankConnections } from "@life/plaid";

export async function runBankTransactionSync() {
  const results = await syncAllActiveBankConnections(prisma);
  const imported = results.reduce((sum, result) => sum + result.importedCount, 0);
  console.log(
    `[plaid] Synced ${results.length} bank connection(s); imported/updated ${imported} purchase(s)`,
  );
}
