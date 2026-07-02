-- CreateEnum
CREATE TYPE "RecipeFolderColor" AS ENUM ('BLUSH', 'SKY', 'MINT', 'LAVENDER', 'LEMON', 'PEACH', 'SAGE', 'LILAC');

-- CreateTable
CREATE TABLE "RecipeFolder" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "color" "RecipeFolderColor" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeFolder_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "folderId" TEXT;

-- CreateIndex
CREATE INDEX "RecipeFolder_householdId_parentId_idx" ON "RecipeFolder"("householdId", "parentId");

-- CreateIndex
CREATE INDEX "Recipe_folderId_idx" ON "Recipe"("folderId");

-- AddForeignKey
ALTER TABLE "RecipeFolder" ADD CONSTRAINT "RecipeFolder_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeFolder" ADD CONSTRAINT "RecipeFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "RecipeFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "RecipeFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
