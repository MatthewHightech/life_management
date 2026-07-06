-- CreateEnum
CREATE TYPE "GearCondition" AS ENUM ('LIKE_NEW', 'GOOD', 'FAIR', 'RETIRED');

-- AlterEnum
ALTER TYPE "FolderNamespace" ADD VALUE 'GEAR';

-- CreateTable
CREATE TABLE "GearItem" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "folderId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "size" TEXT,
    "careInstructions" TEXT,
    "condition" "GearCondition" NOT NULL DEFAULT 'GOOD',
    "photoStorageKey" TEXT,
    "photoMimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GearItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GearItemClass" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "folderId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "careInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GearItemClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GearVariant" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT,
    "condition" "GearCondition" NOT NULL DEFAULT 'GOOD',
    "photoStorageKey" TEXT,
    "photoMimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GearVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GearLoan" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "borrowerName" TEXT NOT NULL,
    "borrowerEmail" TEXT NOT NULL,
    "lentAt" DATE NOT NULL,
    "returnBy" DATE NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GearLoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GearLoanItem" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "gearItemId" TEXT,
    "gearVariantId" TEXT,

    CONSTRAINT "GearLoanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GearItem_householdId_folderId_idx" ON "GearItem"("householdId", "folderId");

-- CreateIndex
CREATE INDEX "GearItemClass_householdId_folderId_idx" ON "GearItemClass"("householdId", "folderId");

-- CreateIndex
CREATE INDEX "GearVariant_classId_idx" ON "GearVariant"("classId");

-- CreateIndex
CREATE INDEX "GearLoan_householdId_returnedAt_idx" ON "GearLoan"("householdId", "returnedAt");

-- CreateIndex
CREATE INDEX "GearLoanItem_loanId_idx" ON "GearLoanItem"("loanId");

-- CreateIndex
CREATE INDEX "GearLoanItem_gearItemId_idx" ON "GearLoanItem"("gearItemId");

-- CreateIndex
CREATE INDEX "GearLoanItem_gearVariantId_idx" ON "GearLoanItem"("gearVariantId");

-- AddForeignKey
ALTER TABLE "GearItem" ADD CONSTRAINT "GearItem_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GearItem" ADD CONSTRAINT "GearItem_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GearItemClass" ADD CONSTRAINT "GearItemClass_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GearItemClass" ADD CONSTRAINT "GearItemClass_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GearVariant" ADD CONSTRAINT "GearVariant_classId_fkey" FOREIGN KEY ("classId") REFERENCES "GearItemClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GearLoan" ADD CONSTRAINT "GearLoan_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GearLoanItem" ADD CONSTRAINT "GearLoanItem_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "GearLoan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GearLoanItem" ADD CONSTRAINT "GearLoanItem_gearItemId_fkey" FOREIGN KEY ("gearItemId") REFERENCES "GearItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GearLoanItem" ADD CONSTRAINT "GearLoanItem_gearVariantId_fkey" FOREIGN KEY ("gearVariantId") REFERENCES "GearVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
