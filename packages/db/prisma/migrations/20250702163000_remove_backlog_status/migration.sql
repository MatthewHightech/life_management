-- Move existing backlog tasks to todo before removing the enum value.
UPDATE "Task" SET "status" = 'TODO' WHERE "status" = 'BACKLOG';

CREATE TYPE "TaskStatus_new" AS ENUM ('TODO', 'IN_PROGRESS', 'WAITING', 'DONE');

ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'TODO';

DROP TYPE "TaskStatus";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
