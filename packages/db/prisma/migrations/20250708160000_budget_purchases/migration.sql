-- Budget purchases inbox and allocations for budget line spend tracking.
CREATE TYPE "BudgetPurchaseSource" AS ENUM ('MANUAL', 'VISA');

CREATE TABLE "BudgetPurchase" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "purchaseDate" DATE NOT NULL,
    "source" "BudgetPurchaseSource" NOT NULL DEFAULT 'MANUAL',
    "externalTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetPurchase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BudgetPurchaseAllocation" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "lineItemId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetPurchaseAllocation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BudgetPurchase_householdId_purchaseDate_idx" ON "BudgetPurchase"("householdId", "purchaseDate");
CREATE INDEX "BudgetPurchaseAllocation_purchaseId_idx" ON "BudgetPurchaseAllocation"("purchaseId");
CREATE INDEX "BudgetPurchaseAllocation_lineItemId_idx" ON "BudgetPurchaseAllocation"("lineItemId");

ALTER TABLE "BudgetPurchase" ADD CONSTRAINT "BudgetPurchase_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetPurchaseAllocation" ADD CONSTRAINT "BudgetPurchaseAllocation_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "BudgetPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetPurchaseAllocation" ADD CONSTRAINT "BudgetPurchaseAllocation_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "BudgetLineItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
