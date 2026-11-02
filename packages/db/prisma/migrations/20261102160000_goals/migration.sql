-- CreateEnum
CREATE TYPE "GoalCadence" AS ENUM ('DAILY', 'WEEKLY', 'TERM');

-- CreateTable
CREATE TABLE "GoalSet" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cadence" "GoalCadence" NOT NULL,
    "label" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalSet_householdId_archivedAt_idx" ON "GoalSet"("householdId", "archivedAt");

-- CreateIndex
CREATE INDEX "GoalSet_householdId_userId_cadence_archivedAt_idx" ON "GoalSet"("householdId", "userId", "cadence", "archivedAt");

-- CreateIndex
CREATE INDEX "Goal_setId_sortOrder_idx" ON "Goal"("setId", "sortOrder");

-- AddForeignKey
ALTER TABLE "GoalSet" ADD CONSTRAINT "GoalSet_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalSet" ADD CONSTRAINT "GoalSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_setId_fkey" FOREIGN KEY ("setId") REFERENCES "GoalSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
