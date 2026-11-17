-- Drop task priority; rename remaining enum for shopping urgency only.
ALTER TABLE "Task" DROP COLUMN "priority";

ALTER TYPE "TaskPriority" RENAME TO "ShoppingUrgency";
