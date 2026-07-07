-- Add scope to budget sections so monthly and annual tables are independent.
ALTER TABLE "BudgetSection" ADD COLUMN "scope" "BudgetLineType" NOT NULL DEFAULT 'MONTHLY';

CREATE INDEX "BudgetSection_householdId_scope_idx" ON "BudgetSection"("householdId", "scope");
