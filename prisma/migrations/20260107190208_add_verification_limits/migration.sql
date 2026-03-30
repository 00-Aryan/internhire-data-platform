-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verificationEmailCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verificationEmailSentAt" TIMESTAMP(3);
