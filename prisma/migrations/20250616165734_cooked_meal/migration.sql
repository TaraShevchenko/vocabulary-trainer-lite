-- CreateEnum
CREATE TYPE "cooked_meal_statuses" AS ENUM ('ACTIVE', 'ARCHIVED');

-- AlterEnum
ALTER TYPE "ItemType" ADD VALUE 'COOKED_MEAL';

-- AlterTable
ALTER TABLE "portion_history" ADD COLUMN     "cookedMealId" TEXT;

-- CreateTable
CREATE TABLE "cooked_meals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "baseMealId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "cooked_meal_statuses" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "cooked_meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cooked_meal_ingredients" (
    "id" TEXT NOT NULL,
    "cookedMealId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" "measurement_units" NOT NULL,

    CONSTRAINT "cooked_meal_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_entry_cooked_meals" (
    "id" TEXT NOT NULL,
    "mealEntryId" TEXT NOT NULL,
    "cookedMealId" TEXT NOT NULL,
    "portionHistoryId" TEXT NOT NULL,

    CONSTRAINT "meal_entry_cooked_meals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cooked_meals_userId_idx" ON "cooked_meals"("userId");

-- CreateIndex
CREATE INDEX "cooked_meals_status_idx" ON "cooked_meals"("status");

-- CreateIndex
CREATE INDEX "cooked_meals_baseMealId_idx" ON "cooked_meals"("baseMealId");

-- CreateIndex
CREATE INDEX "cooked_meals_createdAt_idx" ON "cooked_meals"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "cooked_meal_ingredients_cookedMealId_ingredientId_key" ON "cooked_meal_ingredients"("cookedMealId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "meal_entry_cooked_meals_mealEntryId_cookedMealId_key" ON "meal_entry_cooked_meals"("mealEntryId", "cookedMealId");

-- AddForeignKey
ALTER TABLE "cooked_meals" ADD CONSTRAINT "cooked_meals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cooked_meals" ADD CONSTRAINT "cooked_meals_baseMealId_fkey" FOREIGN KEY ("baseMealId") REFERENCES "meals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cooked_meal_ingredients" ADD CONSTRAINT "cooked_meal_ingredients_cookedMealId_fkey" FOREIGN KEY ("cookedMealId") REFERENCES "cooked_meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cooked_meal_ingredients" ADD CONSTRAINT "cooked_meal_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entry_cooked_meals" ADD CONSTRAINT "meal_entry_cooked_meals_mealEntryId_fkey" FOREIGN KEY ("mealEntryId") REFERENCES "meal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entry_cooked_meals" ADD CONSTRAINT "meal_entry_cooked_meals_cookedMealId_fkey" FOREIGN KEY ("cookedMealId") REFERENCES "cooked_meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entry_cooked_meals" ADD CONSTRAINT "meal_entry_cooked_meals_portionHistoryId_fkey" FOREIGN KEY ("portionHistoryId") REFERENCES "portion_history"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portion_history" ADD CONSTRAINT "portion_history_cookedMealId_fkey" FOREIGN KEY ("cookedMealId") REFERENCES "cooked_meals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
