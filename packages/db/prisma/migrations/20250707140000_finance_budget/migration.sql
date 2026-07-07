-- CreateEnum
CREATE TYPE "BudgetLineType" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateTable
CREATE TABLE "BudgetSection" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLineItem" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "type" "BudgetLineType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLineSpend" (
    "id" TEXT NOT NULL,
    "lineItemId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "spentCents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BudgetLineSpend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BudgetSection_householdId_idx" ON "BudgetSection"("householdId");

-- CreateIndex
CREATE INDEX "BudgetLineItem_householdId_idx" ON "BudgetLineItem"("householdId");

-- CreateIndex
CREATE INDEX "BudgetLineItem_sectionId_idx" ON "BudgetLineItem"("sectionId");

-- CreateIndex
CREATE INDEX "BudgetLineSpend_lineItemId_idx" ON "BudgetLineSpend"("lineItemId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetLineSpend_lineItemId_year_month_key" ON "BudgetLineSpend"("lineItemId", "year", "month");

-- AddForeignKey
ALTER TABLE "BudgetSection" ADD CONSTRAINT "BudgetSection_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLineItem" ADD CONSTRAINT "BudgetLineItem_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLineItem" ADD CONSTRAINT "BudgetLineItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "BudgetSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLineSpend" ADD CONSTRAINT "BudgetLineSpend_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "BudgetLineItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
