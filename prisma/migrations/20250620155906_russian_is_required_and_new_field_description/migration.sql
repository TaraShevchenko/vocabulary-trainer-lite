/*
  Warnings:

  - Added the required column `description` to the `words` table without a default value. This is not possible if the table is not empty.
  - Made the column `russian` on table `words` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "words" ADD COLUMN     "description" TEXT NOT NULL,
ALTER COLUMN "russian" SET NOT NULL;
