// ETL Pipeline for Candidate Scoring & Ranking (Refactored)
// Location: src/core/scoring/scorePipeline.ts
// Run: npx ts-node src/lib/etl/scorePipeline.ts

import { log } from '../../infra/logging/logger';
import { prisma } from '../../infra/db/prisma.client';

// Import pure core scoring engine (NO Prisma, NO Next.js, NO HTTP)
import {
  processSubdomain,
  batchComputeDomainScores,
  batchComputeGlobalScores,
  assignDenseRanks,
  computeCustomCombination,
  type RawScore,
  type SubdomainContext,
  type DomainContext,
  type GlobalContext,
} from './index'; // The new core engine

const BATCH_SIZE = 500; // Process records in chunks to save memory

// ============================================================================
// STEP 1: Process Subdomain Scores
// ============================================================================
// BEFORE: 60+ lines of mixed stats + DB logic
// AFTER: Pure core logic + thin DB wrapper

async function processSubdomainScores() {
  // 1. Get all distinct subdomains (infrastructure concern)
  const distinctSubdomains = await prisma.subdomainRawScore.findMany({
    select: { subdomainId: true },
    distinct: ['subdomainId'],
  });

  let totalProcessed = 0;

  for (const { subdomainId } of distinctSubdomains) {
    // 2. Fetch raw scores for ONLY this subdomain (infrastructure)
    const rawScoresFromDB = await prisma.subdomainRawScore.findMany({
      where: { subdomainId },
      select: { candidateId: true, rawScore: true, subdomainId: true },
    });

    if (rawScoresFromDB.length === 0) continue;

    // 3. Transform to core domain types
    const rawScores: RawScore[] = rawScoresFromDB.map(r => ({
      candidateId: r.candidateId,
      value: r.rawScore,
    }));

    // 4. Call pure core logic (NO DATABASE KNOWLEDGE)
    const context: SubdomainContext = { subdomainId, rawScores };
    const result = processSubdomain(context);

    if (!result.success) {
      log(`Failed to process subdomain ${subdomainId}: ${result.error.message}`, 'ERROR');
      continue;
    }

    // 5. Transform core results back to DB format
    const derivedUpdates = result.data.map(d => ({
      candidateId: d.candidateId,
      subdomainId: subdomainId,
      zScore: d.zScore,
      percentile: d.percentile,
      subdomainScore: d.normalizedScore,
      subdomainRank: 0, // Will be assigned later
      calculatedAt: new Date(),
    }));

    // 6. Persist to database (infrastructure)
    await batchUpsert(derivedUpdates, (d) => prisma.subdomainDerivedScore.upsert({
      where: { candidateId_subdomainId: { candidateId: d.candidateId, subdomainId: d.subdomainId } },
      update: { zScore: d.zScore, percentile: d.percentile, subdomainScore: d.subdomainScore, calculatedAt: d.calculatedAt },
      create: d,
    }));

    totalProcessed += derivedUpdates.length;
  }

  return totalProcessed;
}

// ============================================================================
// STEP 2: Compute Domain Scores
// ============================================================================
// BEFORE: 80+ lines of nested loops + weight logic
// AFTER: Core engine handles all business logic

async function computeDomainScores() {
  // Fetch domain configuration (infrastructure)
  const domains = await prisma.domain.findMany({ include: { subdomains: true } });

  let skip = 0;
  let totalProcessed = 0;

  while (true) {
    // Fetch candidate batch (infrastructure)
    const candidates = await prisma.candidateProfile.findMany({
      select: { id: true },
      take: BATCH_SIZE,
      skip: skip,
    });
    if (candidates.length === 0) break;

    const candidateIds = candidates.map(c => c.id);

    // Fetch derived scores for this batch (infrastructure)
    const derivedScores = await prisma.subdomainDerivedScore.findMany({
      where: { candidateId: { in: candidateIds } },
    });

    // Build lookup map (infrastructure optimization)
    const derivedScoresMap = new Map<string, number>();
    for (const ds of derivedScores) {
      derivedScoresMap.set(`${ds.candidateId}_${ds.subdomainId}`, ds.subdomainScore);
    }

    // Build core domain contexts (transform DB → core types)
    const contexts: DomainContext[] = [];
    for (const candidate of candidates) {
      for (const domain of domains) {
        const subdomainScores = new Map<string, number>();
        const subdomainWeights = new Map<string, number>();

        for (const sub of domain.subdomains) {
          const score = derivedScoresMap.get(`${candidate.id}_${sub.id}`);
          if (score !== undefined) {
            subdomainScores.set(sub.id, score);
            subdomainWeights.set(sub.id, sub.weightInDomain);
          }
        }

        if (subdomainScores.size > 0) {
          contexts.push({
            candidateId: candidate.id,
            domainId: domain.id,
            subdomainScores,
            subdomainWeights,
          });
        }
      }
    }

    // Call pure core logic (NO DATABASE)
    const domainScoreResults = batchComputeDomainScores(contexts);

    // Transform back to DB format
    const domainScores = domainScoreResults.map(result => ({
      candidateId: result.candidateId,
      domainId: contexts.find(c => c.candidateId === result.candidateId)!.domainId,
      domainScore: result.score,
      domainRank: 0,
      calculatedAt: new Date(),
    }));

    // Persist (infrastructure)
    await batchUpsert(domainScores, (d) => prisma.domainScore.upsert({
      where: { candidateId_domainId: { candidateId: d.candidateId, domainId: d.domainId } },
      update: { domainScore: d.domainScore, calculatedAt: d.calculatedAt },
      create: d,
    }));

    totalProcessed += domainScores.length;
    skip += BATCH_SIZE;
    log(`Computed domain scores: ${totalProcessed} candidates processed.`);
  }

  return totalProcessed;
}

// ============================================================================
// STEP 3: Compute Global Scores
// ============================================================================
// BEFORE: Simple average logic mixed with DB
// AFTER: Core handles averaging, infra handles I/O

async function computeGlobalScores() {
  let skip = 0;
  let totalProcessed = 0;

  while (true) {
    // Fetch candidate batch (infrastructure)
    const candidates = await prisma.candidateProfile.findMany({
      select: { id: true },
      take: BATCH_SIZE,
      skip: skip,
    });
    if (candidates.length === 0) break;

    const candidateIds = candidates.map(c => c.id);

    // Fetch domain scores (infrastructure)
    const domainScores = await prisma.domainScore.findMany({
      where: { candidateId: { in: candidateIds } },
    });

    // Group by candidate (infrastructure optimization)
    const domainScoresByCandidate = new Map<string, number[]>();
    for (const ds of domainScores) {
      if (!domainScoresByCandidate.has(ds.candidateId)) {
        domainScoresByCandidate.set(ds.candidateId, []);
      }
      domainScoresByCandidate.get(ds.candidateId)!.push(ds.domainScore);
    }

    // Build core contexts
    const contexts: GlobalContext[] = candidates
      .map(candidate => ({
        candidateId: candidate.id,
        domainScores: domainScoresByCandidate.get(candidate.id) || [],
      }))
      .filter(ctx => ctx.domainScores.length > 0);

    // Call pure core logic
    const globalScoreResults = batchComputeGlobalScores(contexts);

    // Transform to DB format
    const globalScores = globalScoreResults.map(result => ({
      candidateId: result.candidateId,
      globalScore: result.score,
      globalRank: 0,
      calculatedAt: new Date(),
    }));

    // Persist
    await batchUpsert(globalScores, (g) => prisma.globalScore.upsert({
      where: { candidateId: g.candidateId },
      update: { globalScore: g.globalScore, calculatedAt: g.calculatedAt },
      create: g,
    }));

    totalProcessed += globalScores.length;
    skip += BATCH_SIZE;
    log(`Computed global scores: ${totalProcessed} candidates processed.`);
  }

  return totalProcessed;
}

// ============================================================================
// STEP 4: Assign Ranks
// ============================================================================
// BEFORE: Dense rank logic embedded in DB loops
// AFTER: Core handles ranking, infra handles persistence

async function assignRanks() {
  // 1. Subdomain Ranks
  const distinctSubdomains = await prisma.subdomainDerivedScore.findMany({
    select: { subdomainId: true },
    distinct: ['subdomainId'],
  });

  for (const { subdomainId } of distinctSubdomains) {
    const scores = await prisma.subdomainDerivedScore.findMany({
      where: { subdomainId },
      select: { candidateId: true, subdomainScore: true },
    });

    // Call pure core ranking logic
    const ranked = assignDenseRanks(
      scores.map(s => ({ candidateId: s.candidateId, score: s.subdomainScore }))
    );

    const updates = ranked.map(r => ({
      candidateId: r.candidateId,
      subdomainId,
      rank: r.rank,
    }));

    await batchUpsert(updates, (u) => prisma.subdomainDerivedScore.update({
      where: { candidateId_subdomainId: { candidateId: u.candidateId, subdomainId: u.subdomainId } },
      data: { subdomainRank: u.rank },
    }));
  }

  // 2. Domain Ranks
  const distinctDomains = await prisma.domainScore.findMany({
    select: { domainId: true },
    distinct: ['domainId'],
  });

  for (const { domainId } of distinctDomains) {
    const scores = await prisma.domainScore.findMany({
      where: { domainId },
      select: { candidateId: true, domainScore: true },
    });

    const ranked = assignDenseRanks(
      scores.map(s => ({ candidateId: s.candidateId, score: s.domainScore }))
    );

    const updates = ranked.map(r => ({
      candidateId: r.candidateId,
      domainId,
      rank: r.rank,
    }));

    await batchUpsert(updates, (u) => prisma.domainScore.update({
      where: { candidateId_domainId: { candidateId: u.candidateId, domainId: u.domainId } },
      data: { domainRank: u.rank },
    }));
  }

  // 3. Global Ranks
  const globalScores = await prisma.globalScore.findMany({
    select: { candidateId: true, globalScore: true },
  });

  const ranked = assignDenseRanks(
    globalScores.map(s => ({ candidateId: s.candidateId, score: s.globalScore }))
  );

  const updates = ranked.map(r => ({
    candidateId: r.candidateId,
    rank: r.rank,
  }));

  await batchUpsert(updates, (u) => prisma.globalScore.update({
    where: { candidateId: u.candidateId },
    data: { globalRank: u.rank },
  }));
}

// ============================================================================
// Utility: Dynamic Combination Score (API Use)
// ============================================================================
// BEFORE: Logic embedded in API endpoint
// AFTER: Core function + thin DB wrapper

async function computeCombinationScore(candidateId: string, subdomainWeights: Record<string, number>) {
  // Fetch subdomain scores (infrastructure)
  const subdomainScores = await prisma.subdomainDerivedScore.findMany({
    where: { candidateId },
  });

  if (subdomainScores.length === 0) return 0;

  // Transform to core types
  const scoresMap = new Map<string, number>();
  const weightsMap = new Map<string, number>();

  for (const ds of subdomainScores) {
    scoresMap.set(ds.subdomainId, ds.subdomainScore);
  }

  for (const [subdomainId, weight] of Object.entries(subdomainWeights)) {
    weightsMap.set(subdomainId, weight);
  }

  // Call pure core logic
  return computeCustomCombination(scoresMap, weightsMap) ?? 0;
}

// ============================================================================
// Infrastructure Helper: Batch Upsert
// ============================================================================

async function batchUpsert(items: any[], callback: (item: any) => any) {
  const CHUNK_SIZE = 50;
  const MAX_RETRIES = 3;

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);

    let attempt = 0;
    while (true) {
      try {
        await prisma.$transaction(chunk.map(callback));
        break;
      } catch (error) {
        attempt++;
        if (attempt >= MAX_RETRIES) throw error;
        const delay = 1000 * attempt;
        log(`Batch transaction failed (Attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay}ms...`, 'ERROR');
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}

// ============================================================================
// Main ETL Pipeline
// ============================================================================

async function runScorePipeline() {
  log('Starting ETL Pipeline...');

  const subCount = await processSubdomainScores();
  log(`Processed ${subCount} subdomain derived scores.`);

  const domainCount = await computeDomainScores();
  log(`Processed ${domainCount} domain scores.`);

  const globalCount = await computeGlobalScores();
  log(`Processed ${globalCount} global scores.`);

  await assignRanks();
  log('Assigned ranks for subdomain, domain, and global scores.');
}

// Export for API + testing
export {
  processSubdomainScores,
  computeDomainScores,
  computeGlobalScores,
  assignRanks,
  computeCombinationScore,
  runScorePipeline,
};