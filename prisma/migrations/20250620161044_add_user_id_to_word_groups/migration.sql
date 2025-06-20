/*
  Warnings:

  - Added the required column `userId` to the `word_groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "word_groups" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "word_groups_userId_idx" ON "word_groups"("userId");

-- AddForeignKey
ALTER TABLE "word_groups" ADD CONSTRAINT "word_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
