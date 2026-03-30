-- CreateTable
CREATE TABLE "JobDraft" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "JobType",
    "workMode" "WorkMode",
    "domain" TEXT,
    "locationCity" TEXT,
    "locationDistrict" TEXT,
    "locationState" TEXT,
    "deadline" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "officeDaysPerWeek" INTEGER,
    "isPaid" BOOLEAN,
    "stipendAmount" INTEGER,
    "stipendFrequency" TEXT,
    "hasCertificate" BOOLEAN,
    "customPhone" TEXT,
    "customEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recruiterId" TEXT NOT NULL,

    CONSTRAINT "JobDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobDraft_recruiterId_idx" ON "JobDraft"("recruiterId");

-- AddForeignKey
ALTER TABLE "JobDraft" ADD CONSTRAINT "JobDraft_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "RecruiterProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
