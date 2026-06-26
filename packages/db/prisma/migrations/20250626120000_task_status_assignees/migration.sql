-- Extend TaskStatus enum
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'BACKLOG';
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'WAITING';

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("taskId","userId")
);

-- Migrate existing single assignees
INSERT INTO "TaskAssignment" ("taskId", "userId", "assignedAt")
SELECT "id", "assigneeId", CURRENT_TIMESTAMP
FROM "Task"
WHERE "assigneeId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_assigneeId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Task_assigneeId_idx";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN IF EXISTS "assigneeId";

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "TaskAssignment_userId_idx" ON "TaskAssignment"("userId");
