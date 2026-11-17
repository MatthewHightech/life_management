UPDATE "Task" SET "priority" = 'HIGH' WHERE "priority" = 'URGENT';
UPDATE "ShoppingItem" SET "urgency" = 'HIGH' WHERE "urgency" = 'URGENT';

ALTER TABLE "Task" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "ShoppingItem" ALTER COLUMN "urgency" DROP DEFAULT;

ALTER TYPE "TaskPriority" RENAME TO "TaskPriority_old";
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

ALTER TABLE "Task" ALTER COLUMN "priority" TYPE "TaskPriority" USING ("priority"::text::"TaskPriority");
ALTER TABLE "ShoppingItem" ALTER COLUMN "urgency" TYPE "TaskPriority" USING ("urgency"::text::"TaskPriority");

ALTER TABLE "Task" ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';
ALTER TABLE "ShoppingItem" ALTER COLUMN "urgency" SET DEFAULT 'MEDIUM';

DROP TYPE "TaskPriority_old";
