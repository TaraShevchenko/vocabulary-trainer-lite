-- CreateTable
CREATE TABLE "user_statistics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "wordsAdded" INTEGER NOT NULL DEFAULT 0,
    "wordsLearned" INTEGER NOT NULL DEFAULT 0,
    "wordsRepeated" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_statistics_userId_idx" ON "user_statistics"("userId");

-- CreateIndex
CREATE INDEX "user_statistics_date_idx" ON "user_statistics"("date");

-- CreateIndex
CREATE INDEX "user_statistics_userId_date_idx" ON "user_statistics"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "user_statistics_userId_date_key" ON "user_statistics"("userId", "date");

-- AddForeignKey
ALTER TABLE "user_statistics" ADD CONSTRAINT "user_statistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
