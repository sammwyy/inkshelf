/*
  Warnings:

  - You are about to drop the column `userId` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `favorites` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ratings` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `reading_history` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `reading_progress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_lists` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileId,seriesId]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,seriesId]` on the table `ratings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileId,chapterId]` on the table `reading_progress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `user_profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profileId` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `favorites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `ratings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `reading_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `reading_progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `user_lists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `user_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_userId_fkey";

-- DropForeignKey
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_userId_fkey";

-- DropForeignKey
ALTER TABLE "reading_history" DROP CONSTRAINT "reading_history_userId_fkey";

-- DropForeignKey
ALTER TABLE "reading_progress" DROP CONSTRAINT "reading_progress_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_lists" DROP CONSTRAINT "user_lists_userId_fkey";

-- DropIndex
DROP INDEX "comments_userId_idx";

-- DropIndex
DROP INDEX "favorites_userId_idx";

-- DropIndex
DROP INDEX "favorites_userId_seriesId_key";

-- DropIndex
DROP INDEX "ratings_userId_idx";

-- DropIndex
DROP INDEX "ratings_userId_seriesId_key";

-- DropIndex
DROP INDEX "reading_history_userId_readAt_idx";

-- DropIndex
DROP INDEX "reading_progress_userId_chapterId_key";

-- DropIndex
DROP INDEX "reading_progress_userId_idx";

-- DropIndex
DROP INDEX "user_lists_userId_idx";

-- DropIndex
DROP INDEX "users_username_idx";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "favorites" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ratings" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "reading_history" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "reading_progress" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_lists" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "username";

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
    "showFavorites" BOOLEAN NOT NULL DEFAULT true,
    "showRatings" BOOLEAN NOT NULL DEFAULT true,
    "showComments" BOOLEAN NOT NULL DEFAULT true,
    "showLists" BOOLEAN NOT NULL DEFAULT true,
    "showProgress" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "comments_profileId_idx" ON "comments"("profileId");

-- CreateIndex
CREATE INDEX "favorites_profileId_idx" ON "favorites"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_profileId_seriesId_key" ON "favorites"("profileId", "seriesId");

-- CreateIndex
CREATE INDEX "ratings_profileId_idx" ON "ratings"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_profileId_seriesId_key" ON "ratings"("profileId", "seriesId");

-- CreateIndex
CREATE INDEX "reading_history_profileId_readAt_idx" ON "reading_history"("profileId", "readAt");

-- CreateIndex
CREATE INDEX "reading_progress_profileId_idx" ON "reading_progress"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "reading_progress_profileId_chapterId_key" ON "reading_progress"("profileId", "chapterId");

-- CreateIndex
CREATE INDEX "user_lists_profileId_idx" ON "user_lists"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_username_key" ON "user_profiles"("username");

-- CreateIndex
CREATE INDEX "user_profiles_username_idx" ON "user_profiles"("username");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lists" ADD CONSTRAINT "user_lists_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
