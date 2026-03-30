/*
  Warnings:

  - You are about to drop the column `subscriptionExpiry` on the `CandidateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionPlan` on the `CandidateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionPlan` on the `RecruiterProfile` table. All the data in the column will be lost.
  - You are about to drop the `Education` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CandidateProfileToSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_JobListingToSkill` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `senderType` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('RECRUITER', 'CANDIDATE');

-- DropForeignKey
ALTER TABLE "Education" DROP CONSTRAINT "Education_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Education" DROP CONSTRAINT "Education_establishmentId_fkey";

-- DropForeignKey
ALTER TABLE "_CandidateProfileToSkill" DROP CONSTRAINT "_CandidateProfileToSkill_A_fkey";

-- DropForeignKey
ALTER TABLE "_CandidateProfileToSkill" DROP CONSTRAINT "_CandidateProfileToSkill_B_fkey";

-- DropForeignKey
ALTER TABLE "_JobListingToSkill" DROP CONSTRAINT "_JobListingToSkill_A_fkey";

-- DropForeignKey
ALTER TABLE "_JobListingToSkill" DROP CONSTRAINT "_JobListingToSkill_B_fkey";

-- DropIndex
DROP INDEX "RecruiterProfile_userId_idx";

-- AlterTable
ALTER TABLE "CandidateProfile" DROP COLUMN "subscriptionExpiry",
DROP COLUMN "subscriptionPlan",
ADD COLUMN     "assessmentsSubscriptionExpiry" TIMESTAMP(3),
ADD COLUMN     "internshipsSubscriptionExpiry" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "candidateId" TEXT,
ADD COLUMN     "recruiterId" TEXT,
ADD COLUMN     "senderType" "SenderType" NOT NULL;

-- AlterTable
ALTER TABLE "JobListing" ADD COLUMN     "domain" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "RecruiterProfile" DROP COLUMN "subscriptionPlan";

-- DropTable
DROP TABLE "Education";

-- DropTable
DROP TABLE "_CandidateProfileToSkill";

-- DropTable
DROP TABLE "_JobListingToSkill";

-- DropEnum
DROP TYPE "EducationLevel";

-- CreateTable
CREATE TABLE "TenthEducation" (
    "id" TEXT NOT NULL,
    "passingYear" INTEGER NOT NULL,
    "percentageMarks" DOUBLE PRECISION NOT NULL,
    "stream" TEXT,
    "candidateId" TEXT NOT NULL,
    "establishmentId" TEXT,

    CONSTRAINT "TenthEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwelfthEducation" (
    "id" TEXT NOT NULL,
    "passingYear" INTEGER NOT NULL,
    "percentageMarks" DOUBLE PRECISION NOT NULL,
    "stream" TEXT,
    "candidateId" TEXT NOT NULL,
    "establishmentId" TEXT,

    CONSTRAINT "TwelfthEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UGEducation" (
    "id" TEXT NOT NULL,
    "department" TEXT,
    "courseName" TEXT NOT NULL,
    "currentYear" INTEGER,
    "joinYear" INTEGER,
    "completionYear" INTEGER NOT NULL,
    "cgpa" DOUBLE PRECISION,
    "candidateId" TEXT NOT NULL,
    "establishmentId" TEXT,

    CONSTRAINT "UGEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PGEducation" (
    "id" TEXT NOT NULL,
    "department" TEXT,
    "courseName" TEXT NOT NULL,
    "currentYear" INTEGER,
    "joinYear" INTEGER,
    "completionYear" INTEGER NOT NULL,
    "cgpa" DOUBLE PRECISION,
    "candidateId" TEXT NOT NULL,
    "establishmentId" TEXT,

    CONSTRAINT "PGEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateSkill" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "CandidateSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSkill" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenthEducation_candidateId_key" ON "TenthEducation"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "TwelfthEducation_candidateId_key" ON "TwelfthEducation"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateSkill_candidateId_skillId_key" ON "CandidateSkill"("candidateId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSkill_jobId_skillId_key" ON "JobSkill"("jobId", "skillId");

-- AddForeignKey
ALTER TABLE "TenthEducation" ADD CONSTRAINT "TenthEducation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenthEducation" ADD CONSTRAINT "TenthEducation_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwelfthEducation" ADD CONSTRAINT "TwelfthEducation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwelfthEducation" ADD CONSTRAINT "TwelfthEducation_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UGEducation" ADD CONSTRAINT "UGEducation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UGEducation" ADD CONSTRAINT "UGEducation_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGEducation" ADD CONSTRAINT "PGEducation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PGEducation" ADD CONSTRAINT "PGEducation_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "RecruiterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
