/*
  Warnings:

  - You are about to drop the column `mealType` on the `meal_entries` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "meal_entries_mealType_idx";

-- AlterTable
ALTER TABLE "meal_entries" DROP COLUMN "mealType";

-- DropEnum
DROP TYPE "MealType";
