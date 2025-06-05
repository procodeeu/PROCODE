/*
  Warnings:

  - You are about to drop the column `contextData` on the `user_contexts` table. All the data in the column will be lost.
  - You are about to drop the column `currentGoals` on the `user_contexts` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `user_contexts` table. All the data in the column will be lost.
  - You are about to drop the column `recentActivity` on the `user_contexts` table. All the data in the column will be lost.
  - You are about to drop the column `schedule` on the `user_contexts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_contexts" DROP COLUMN "contextData",
DROP COLUMN "currentGoals",
DROP COLUMN "preferences",
DROP COLUMN "recentActivity",
DROP COLUMN "schedule",
ADD COLUMN     "analysisResults" JSONB,
ADD COLUMN     "careerPlans" JSONB,
ADD COLUMN     "challenges" JSONB,
ADD COLUMN     "communicationStyle" JSONB,
ADD COLUMN     "currentSituation" TEXT,
ADD COLUMN     "dailyRoutine" JSONB,
ADD COLUMN     "healthGoals" JSONB,
ADD COLUMN     "longTermGoals" JSONB,
ADD COLUMN     "notificationSettings" JSONB,
ADD COLUMN     "personalBio" TEXT,
ADD COLUMN     "proactiveTopics" JSONB,
ADD COLUMN     "relationships" JSONB,
ADD COLUMN     "shortTermGoals" JSONB,
ADD COLUMN     "skillsToLearn" JSONB,
ADD COLUMN     "workContext" JSONB;

-- CreateTable
CREATE TABLE "telegram_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "telegramChatId" TEXT NOT NULL,
    "telegramUsername" TEXT,
    "connectionToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3),

    CONSTRAINT "telegram_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_connections_userId_key" ON "telegram_connections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_connections_telegramChatId_key" ON "telegram_connections"("telegramChatId");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_connections_connectionToken_key" ON "telegram_connections"("connectionToken");

-- AddForeignKey
ALTER TABLE "telegram_connections" ADD CONSTRAINT "telegram_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
