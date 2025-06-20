-- AlterTable
ALTER TABLE "ingredients" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "meals" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "quick_meals" ALTER COLUMN "userId" DROP NOT NULL;
