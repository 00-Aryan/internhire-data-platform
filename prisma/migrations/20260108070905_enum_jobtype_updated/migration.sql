/*
  Warnings:

  - The values [PROJECT_WORK,FULL_TIME] on the enum `JobType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JobType_new" AS ENUM ('INTERNSHIP_FULL_TIME', 'INTERNSHIP_PART_TIME', 'PROJECT_WORK_PART_TIME', 'PROJECT_WORK_FULL_TIME');
ALTER TABLE "JobListing" ALTER COLUMN "type" TYPE "JobType_new" USING ("type"::text::"JobType_new");
ALTER TYPE "JobType" RENAME TO "JobType_old";
ALTER TYPE "JobType_new" RENAME TO "JobType";
DROP TYPE "public"."JobType_old";
COMMIT;
