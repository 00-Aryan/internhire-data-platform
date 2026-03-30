-- 1. Add updatedAt safely for existing rows
ALTER TABLE "JobListing"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- 2. Relax constraints to allow drafts in JobListing
ALTER TABLE "JobListing"
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "workMode" DROP NOT NULL,
ALTER COLUMN "deadline" DROP NOT NULL;

-- 3. Indexes (safe, non-destructive)
CREATE INDEX IF NOT EXISTS "JobListing_recruiterId_idx"
ON "JobListing"("recruiterId");

CREATE INDEX IF NOT EXISTS "JobListing_status_idx"
ON "JobListing"("status");
