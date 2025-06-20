-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('INGREDIENT', 'MEAL', 'QUICK_MEAL');

-- CreateEnum
CREATE TYPE "measurement_units" AS ENUM ('GRAMS', 'PIECES', 'SERVING');

-- CreateEnum
CREATE TYPE "owner_types" AS ENUM ('USER', 'FAMILY');

-- CreateEnum
CREATE TYPE "shopping_item_statuses" AS ENUM ('MUST_BUY', 'CHECK_AVAILABILITY', 'BOUGHT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "name" TEXT,
    "imageUrl" TEXT,
    "username" TEXT,
    "clerkCreatedAt" TIMESTAMP(3),
    "clerkUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "families" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "calories" DOUBLE PRECISION DEFAULT 0,
    "protein" DOUBLE PRECISION DEFAULT 0,
    "carbs" DOUBLE PRECISION DEFAULT 0,
    "fat" DOUBLE PRECISION DEFAULT 0,
    "gramsPerPiece" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "expectedYield" DOUBLE PRECISION,
    "actualYield" DOUBLE PRECISION,
    "prepTime" INTEGER,
    "cookTime" INTEGER,
    "gramsPerServing" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_ingredients" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" "measurement_units" NOT NULL,

    CONSTRAINT "meal_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quick_meals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "calories" DOUBLE PRECISION DEFAULT 0,
    "protein" DOUBLE PRECISION DEFAULT 0,
    "carbs" DOUBLE PRECISION DEFAULT 0,
    "fat" DOUBLE PRECISION DEFAULT 0,
    "gramsPerServing" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quick_meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mealTime" TIMESTAMP(3),
    "mealType" "MealType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_entry_ingredients" (
    "id" TEXT NOT NULL,
    "mealEntryId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "portionHistoryId" TEXT NOT NULL,

    CONSTRAINT "meal_entry_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_entry_meals" (
    "id" TEXT NOT NULL,
    "mealEntryId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "portionHistoryId" TEXT NOT NULL,

    CONSTRAINT "meal_entry_meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_entry_quick_meals" (
    "id" TEXT NOT NULL,
    "mealEntryId" TEXT NOT NULL,
    "quickMealId" TEXT NOT NULL,
    "portionHistoryId" TEXT NOT NULL,

    CONSTRAINT "meal_entry_quick_meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portion_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" "measurement_units" NOT NULL,
    "frequency" INTEGER NOT NULL,
    "lastUsed" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ingredientId" TEXT,
    "mealId" TEXT,
    "quickMealId" TEXT,

    CONSTRAINT "portion_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_lists" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "ownerType" "owner_types" NOT NULL,
    "name" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "familyId" TEXT,

    CONSTRAINT "shopping_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_list_items" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "totalGrams" DOUBLE PRECISION NOT NULL,
    "status" "shopping_item_statuses" NOT NULL DEFAULT 'MUST_BUY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopping_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_packaging" (
    "id" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "packageSize" DOUBLE PRECISION NOT NULL,
    "unit" "measurement_units" NOT NULL,
    "storeName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredient_packaging_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "family_members_familyId_idx" ON "family_members"("familyId");

-- CreateIndex
CREATE INDEX "family_members_userId_idx" ON "family_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "family_members_familyId_userId_key" ON "family_members"("familyId", "userId");

-- CreateIndex
CREATE INDEX "ingredients_userId_idx" ON "ingredients"("userId");

-- CreateIndex
CREATE INDEX "meals_userId_idx" ON "meals"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "meal_ingredients_mealId_ingredientId_key" ON "meal_ingredients"("mealId", "ingredientId");

-- CreateIndex
CREATE INDEX "quick_meals_userId_idx" ON "quick_meals"("userId");

-- CreateIndex
CREATE INDEX "meal_entries_userId_idx" ON "meal_entries"("userId");

-- CreateIndex
CREATE INDEX "meal_entries_date_idx" ON "meal_entries"("date");

-- CreateIndex
CREATE INDEX "meal_entries_mealTime_idx" ON "meal_entries"("mealTime");

-- CreateIndex
CREATE INDEX "meal_entries_mealType_idx" ON "meal_entries"("mealType");

-- CreateIndex
CREATE UNIQUE INDEX "meal_entry_ingredients_mealEntryId_ingredientId_key" ON "meal_entry_ingredients"("mealEntryId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "meal_entry_meals_mealEntryId_mealId_key" ON "meal_entry_meals"("mealEntryId", "mealId");

-- CreateIndex
CREATE UNIQUE INDEX "meal_entry_quick_meals_mealEntryId_quickMealId_key" ON "meal_entry_quick_meals"("mealEntryId", "quickMealId");

-- CreateIndex
CREATE INDEX "portion_history_userId_idx" ON "portion_history"("userId");

-- CreateIndex
CREATE INDEX "portion_history_itemId_itemType_idx" ON "portion_history"("itemId", "itemType");

-- CreateIndex
CREATE INDEX "portion_history_lastUsed_idx" ON "portion_history"("lastUsed");

-- CreateIndex
CREATE INDEX "portion_history_frequency_idx" ON "portion_history"("frequency");

-- CreateIndex
CREATE UNIQUE INDEX "portion_history_userId_itemId_itemType_key" ON "portion_history"("userId", "itemId", "itemType");

-- CreateIndex
CREATE INDEX "shopping_lists_ownerId_idx" ON "shopping_lists"("ownerId");

-- CreateIndex
CREATE INDEX "shopping_lists_ownerType_idx" ON "shopping_lists"("ownerType");

-- CreateIndex
CREATE INDEX "shopping_lists_dateFrom_dateTo_idx" ON "shopping_lists"("dateFrom", "dateTo");

-- CreateIndex
CREATE INDEX "shopping_list_items_listId_idx" ON "shopping_list_items"("listId");

-- CreateIndex
CREATE INDEX "shopping_list_items_status_idx" ON "shopping_list_items"("status");

-- CreateIndex
CREATE UNIQUE INDEX "shopping_list_items_listId_ingredientId_key" ON "shopping_list_items"("listId", "ingredientId");

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_ingredients" ADD CONSTRAINT "meal_ingredients_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_ingredients" ADD CONSTRAINT "meal_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_meals" ADD CONSTRAINT "quick_meals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entry_ingredients" ADD CONSTRAINT "meal_entry_ingredients_mealEntryId_fkey" FOREIGN KEY ("mealEntryId") REFERENCES "meal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entry_ingredients" ADD CONSTRAINT "meal_entry_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entry_ingredients" ADD CONSTRAINT "meal_entry_ingredients_portionHistoryId_fkey" FOREIGN KEY ("portionHistoryId") REFERENCES "portion_history"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entry_meals" ADD CONSTRAINT "meal_entry_meals_mealEntryId_fkey" FOREIGN KEY ("mealEntryId") REFERENCES "meal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entry_meals" ADD CONSTRAINT "meal_entry_meals_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entry_meals" ADD CONSTRAINT "meal_entry_meals_portionHistoryId_fkey" FOREIGN KEY ("portionHistoryId") REFERENCES "portion_history"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entry_quick_meals" ADD CONSTRAINT "meal_entry_quick_meals_mealEntryId_fkey" FOREIGN KEY ("mealEntryId") REFERENCES "meal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entry_quick_meals" ADD CONSTRAINT "meal_entry_quick_meals_quickMealId_fkey" FOREIGN KEY ("quickMealId") REFERENCES "quick_meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_entry_quick_meals" ADD CONSTRAINT "meal_entry_quick_meals_portionHistoryId_fkey" FOREIGN KEY ("portionHistoryId") REFERENCES "portion_history"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portion_history" ADD CONSTRAINT "portion_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portion_history" ADD CONSTRAINT "portion_history_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portion_history" ADD CONSTRAINT "portion_history_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portion_history" ADD CONSTRAINT "portion_history_quickMealId_fkey" FOREIGN KEY ("quickMealId") REFERENCES "quick_meals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_listId_fkey" FOREIGN KEY ("listId") REFERENCES "shopping_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_packaging" ADD CONSTRAINT "ingredient_packaging_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
