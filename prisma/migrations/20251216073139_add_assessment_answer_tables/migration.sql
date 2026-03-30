-- CreateTable
CREATE TABLE "AssessmentAnswer" (
    "candidateId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "subdomainId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentAnswer_pkey" PRIMARY KEY ("candidateId","questionId","subdomainId")
);

-- CreateTable
CREATE TABLE "AssessmentMCQStandardAnswer" (
    "candidateId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "subdomainId" TEXT NOT NULL,
    "selectedOption" INTEGER NOT NULL,

    CONSTRAINT "AssessmentMCQStandardAnswer_pkey" PRIMARY KEY ("candidateId","questionId","subdomainId")
);

-- CreateIndex
CREATE INDEX "AssessmentAnswer_subdomainId_idx" ON "AssessmentAnswer"("subdomainId");

-- CreateIndex
CREATE INDEX "AssessmentAnswer_answeredAt_idx" ON "AssessmentAnswer"("answeredAt");

-- AddForeignKey
ALTER TABLE "AssessmentAnswer" ADD CONSTRAINT "AssessmentAnswer_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAnswer" ADD CONSTRAINT "AssessmentAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAnswer" ADD CONSTRAINT "AssessmentAnswer_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAnswer" ADD CONSTRAINT "AssessmentAnswer_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "QuestionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentMCQStandardAnswer" ADD CONSTRAINT "AssessmentMCQStandardAnswer_candidateId_questionId_subdoma_fkey" FOREIGN KEY ("candidateId", "questionId", "subdomainId") REFERENCES "AssessmentAnswer"("candidateId", "questionId", "subdomainId") ON DELETE CASCADE ON UPDATE CASCADE;
