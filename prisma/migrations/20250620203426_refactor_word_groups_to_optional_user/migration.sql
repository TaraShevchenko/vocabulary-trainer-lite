/*
  Warnings:

  - You are about to drop the column `userId` on the `word_groups` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "word_groups" DROP CONSTRAINT "word_groups_userId_fkey";

-- DropIndex
DROP INDEX "word_groups_userId_idx";

-- AlterTable
ALTER TABLE "word_groups" DROP COLUMN "userId",
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "isGlobal" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "_FavoriteGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FavoriteGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FavoriteGroups_B_index" ON "_FavoriteGroups"("B");

-- CreateIndex
CREATE INDEX "word_groups_createdBy_idx" ON "word_groups"("createdBy");

-- CreateIndex
CREATE INDEX "word_groups_isGlobal_idx" ON "word_groups"("isGlobal");

-- AddForeignKey
ALTER TABLE "word_groups" ADD CONSTRAINT "word_groups_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavoriteGroups" ADD CONSTRAINT "_FavoriteGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavoriteGroups" ADD CONSTRAINT "_FavoriteGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "word_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
