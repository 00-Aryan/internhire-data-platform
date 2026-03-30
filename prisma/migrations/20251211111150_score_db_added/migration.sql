-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subdomain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weightInDomain" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "maxScore" INTEGER NOT NULL,
    "domainId" TEXT NOT NULL,

    CONSTRAINT "Subdomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubdomainRawScore" (
    "candidateId" TEXT NOT NULL,
    "subdomainId" TEXT NOT NULL,
    "rawScore" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubdomainRawScore_pkey" PRIMARY KEY ("candidateId","subdomainId")
);

-- CreateTable
CREATE TABLE "SubdomainDerivedScore" (
    "candidateId" TEXT NOT NULL,
    "subdomainId" TEXT NOT NULL,
    "zScore" DOUBLE PRECISION NOT NULL,
    "percentile" DOUBLE PRECISION NOT NULL,
    "subdomainScore" DOUBLE PRECISION NOT NULL,
    "subdomainRank" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubdomainDerivedScore_pkey" PRIMARY KEY ("candidateId","subdomainId")
);

-- CreateTable
CREATE TABLE "DomainScore" (
    "candidateId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "domainScore" DOUBLE PRECISION NOT NULL,
    "domainRank" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DomainScore_pkey" PRIMARY KEY ("candidateId","domainId")
);

-- CreateTable
CREATE TABLE "GlobalScore" (
    "candidateId" TEXT NOT NULL,
    "globalScore" DOUBLE PRECISION NOT NULL,
    "globalRank" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalScore_pkey" PRIMARY KEY ("candidateId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Domain_name_key" ON "Domain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subdomain_domainId_name_key" ON "Subdomain"("domainId", "name");

-- CreateIndex
CREATE INDEX "SubdomainRawScore_timestamp_idx" ON "SubdomainRawScore"("timestamp");

-- CreateIndex
CREATE INDEX "SubdomainDerivedScore_calculatedAt_idx" ON "SubdomainDerivedScore"("calculatedAt");

-- CreateIndex
CREATE INDEX "DomainScore_calculatedAt_idx" ON "DomainScore"("calculatedAt");

-- CreateIndex
CREATE INDEX "GlobalScore_calculatedAt_idx" ON "GlobalScore"("calculatedAt");

-- AddForeignKey
ALTER TABLE "Subdomain" ADD CONSTRAINT "Subdomain_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubdomainRawScore" ADD CONSTRAINT "SubdomainRawScore_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubdomainRawScore" ADD CONSTRAINT "SubdomainRawScore_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubdomainDerivedScore" ADD CONSTRAINT "SubdomainDerivedScore_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubdomainDerivedScore" ADD CONSTRAINT "SubdomainDerivedScore_subdomainId_fkey" FOREIGN KEY ("subdomainId") REFERENCES "Subdomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainScore" ADD CONSTRAINT "DomainScore_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainScore" ADD CONSTRAINT "DomainScore_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalScore" ADD CONSTRAINT "GlobalScore_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
