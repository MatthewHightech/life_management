-- Migrate any folders using removed colors before shrinking the enum.
UPDATE "RecipeFolder" SET "color" = 'BLUSH' WHERE "color" IN ('MINT', 'LILAC');

ALTER TYPE "RecipeFolderColor" RENAME TO "RecipeFolderColor_old";

CREATE TYPE "RecipeFolderColor" AS ENUM ('BLUSH', 'SKY', 'LAVENDER', 'LEMON', 'PEACH', 'SAGE');

ALTER TABLE "RecipeFolder"
  ALTER COLUMN "color" TYPE "RecipeFolderColor"
  USING ("color"::text::"RecipeFolderColor");

DROP TYPE "RecipeFolderColor_old";
