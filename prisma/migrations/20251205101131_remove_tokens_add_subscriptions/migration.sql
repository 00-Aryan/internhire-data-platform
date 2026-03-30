/*
  Warnings:

  - You are about to drop the column `tokenBalance` on the `CandidateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `tokenBalance` on the `RecruiterProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CandidateProfile" DROP COLUMN "tokenBalance",
ADD COLUMN     "canApplyToJobs" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canTakeAssessments" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionExpiry" TIMESTAMP(3),
ADD COLUMN     "subscriptionPlan" TEXT DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "RecruiterProfile" DROP COLUMN "tokenBalance",
ADD COLUMN     "jobPostLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jobsPostedThisMonth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subscriptionExpiry" TIMESTAMP(3),
ADD COLUMN     "subscriptionPlan" TEXT DEFAULT 'FREE';
