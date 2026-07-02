-- CreateEnum
CREATE TYPE "FolderNamespace" AS ENUM ('MEALS', 'RECEIPTS');

-- RenameEnum
ALTER TYPE "RecipeFolderColor" RENAME TO "FolderColor";

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "namespace" "FolderNamespace" NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "color" "FolderColor" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- Migrate recipe folders into generic folders
INSERT INTO "Folder" ("id", "householdId", "namespace", "parentId", "name", "color", "sortOrder", "createdAt", "updatedAt")
SELECT "id", "householdId", 'MEALS', "parentId", "name", "color", "sortOrder", "createdAt", "updatedAt"
FROM "RecipeFolder";

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "folderId" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- DropTable
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_folderId_fkey";
DROP TABLE "RecipeFolder";

-- CreateIndex
CREATE INDEX "Folder_householdId_namespace_parentId_idx" ON "Folder"("householdId", "namespace", "parentId");

-- CreateIndex
CREATE INDEX "Receipt_householdId_folderId_idx" ON "Receipt"("householdId", "folderId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_householdId_storageKey_key" ON "Receipt"("householdId", "storageKey");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
