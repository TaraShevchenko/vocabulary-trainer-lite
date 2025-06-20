/*
  Warnings:

  - You are about to drop the `user_progress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_wordId_fkey";

-- AlterTable
ALTER TABLE "words" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "user_progress";
