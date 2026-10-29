-- Boards are TaskProject rows ordered across the household tab bar.
ALTER TABLE "TaskProject" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "householdId" ORDER BY "createdAt" ASC, "id" ASC) AS rn
  FROM "TaskProject"
)
UPDATE "TaskProject" AS project
SET "sortOrder" = ranked.rn
FROM ranked
WHERE project."id" = ranked.id;

INSERT INTO "TaskProject" ("id", "householdId", "name", "sortOrder", "createdAt", "updatedAt")
SELECT
  'family_' || household."id",
  household."id",
  'Family Tasks',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Household" AS household
WHERE NOT EXISTS (
  SELECT 1
  FROM "TaskProject" AS existing
  WHERE existing."householdId" = household."id"
    AND existing."name" = 'Family Tasks'
);

UPDATE "TaskProject"
SET "sortOrder" = 0
WHERE "name" = 'Family Tasks';

UPDATE "Task" AS task
SET "projectId" = family."id"
FROM (
  SELECT DISTINCT ON ("householdId") "id", "householdId"
  FROM "TaskProject"
  WHERE "name" = 'Family Tasks'
  ORDER BY "householdId", "sortOrder" ASC, "createdAt" ASC
) AS family
WHERE task."householdId" = family."householdId"
  AND task."projectId" IS NULL;

CREATE INDEX "TaskProject_householdId_sortOrder_idx" ON "TaskProject"("householdId", "sortOrder");
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");
