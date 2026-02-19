-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerificationCode" TEXT,
ADD COLUMN     "emailVerificationSentAt" TIMESTAMP(3);
