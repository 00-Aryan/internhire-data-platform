// src/core/scoring/index.ts
// Public API for the core scoring engine
// Framework-agnostic, pure business logic

// ============================================================================
// TYPES
// ============================================================================
export type {
  RawScore,
  ScoreStatistics,
  DerivedScore,
  WeightedComponent,
  AggregatedScore,
  RankedScore,
  ScoringConfig,
  SubdomainContext,
  DomainContext,
  GlobalContext,
  ScoringError,
  ScoringResult,
} from './types';

// ============================================================================
// STATISTICS
// ============================================================================
export {
  computeStatistics,
  transformToZScore,
  zScoreToPercentile,
  transformScore,
  batchTransformScores,
} from './statistics';

// ============================================================================
// NORMALIZATION
// ============================================================================
export {
  DEFAULT_SCORING_CONFIG,
  percentileToScore,
  roundScore,
  formatScore,
  isValidScore,
  clampScore,
} from './normalization';

// ============================================================================
// WEIGHTING
// ============================================================================
export {
  computeWeightedAverage,
  aggregateScoreForCandidate,
  computeSimpleAverage,
  computeCustomCombination,
} from './weighting';

// ============================================================================
// RANKING
// ============================================================================
export {
  assignDenseRanks,
  getRankForCandidate,
  rankWithinGroups,
  rankToPercentile,
} from './ranking';

// ============================================================================
// SUBDOMAIN SCORING
// ============================================================================
export {
  computeSubdomainScore,
  processSubdomain,
  batchProcessSubdomains,
  getScoreForCandidate,
} from './subdomain';

// ============================================================================
// DOMAIN SCORING
// ============================================================================
export {
  computeDomainScore,
  batchComputeDomainScores,
  computeCandidateDomainScore,
  validateDomainContext,
} from './domain';

// ============================================================================
// GLOBAL SCORING
// ============================================================================
export {
  computeGlobalScore,
  batchComputeGlobalScores,
  computeCandidateGlobalScore,
  validateGlobalContext,
  computeGlobalScoreWithConfidence,
} from './global';

// ============================================================================
// HIGH-LEVEL WORKFLOWS
// ============================================================================

/**
 * Complete scoring workflow for a candidate
 * 
 * This orchestrates the full pipeline but remains infrastructure-agnostic.
 * Data fetching is handled by the caller.
 * 
 * Example usage in your ETL:
 * ```typescript
 * import { scoreCandidateWorkflow } from '@/core/scoring';
 * 
 * const rawScores = await fetchRawScoresFromDB(candidateId);
 * const result = scoreCandidateWorkflow({
 *   candidateId,
 *   subdomains: [
 *     { id: 'sd1', rawScores: [...], weight: 0.5 },
 *     { id: 'sd2', rawScores: [...], weight: 0.5 },
 *   ],
 *   domains: [
 *     { id: 'd1', subdomainIds: ['sd1', 'sd2'] },
 *   ],
 * });
 * ```
 */

import { processSubdomain } from './subdomain';
import { computeDomainScore } from './domain';
import { computeGlobalScore } from './global';
import { assignDenseRanks } from './ranking';

interface CandidateScoringWorkflow {
  candidateId: string;
  subdomains: Array<{
    id: string;
    rawScores: Array<{ candidateId: string; value: number }>;
    weight: number;
  }>;
  domains: Array<{
    id: string;
    subdomainIds: string[];
  }>;
}

/**
 * Score a single candidate through the complete pipeline
 * 
 * Pure orchestration - no I/O, no side effects
 */
export function scoreCandidateWorkflow(workflow: CandidateScoringWorkflow) {
  const { candidateId, subdomains, domains } = workflow;

  // Step 1: Process subdomain scores
  const subdomainScores = new Map<string, number>();
  for (const subdomain of subdomains) {
    const result = processSubdomain({
      subdomainId: subdomain.id,
      rawScores: subdomain.rawScores,
    });

    if (result.success) {
      const candidateScore = result.data.find(s => s.candidateId === candidateId);
      if (candidateScore) {
        subdomainScores.set(subdomain.id, candidateScore.normalizedScore);
      }
    }
  }

  // Step 2: Compute domain scores
  const domainScores: number[] = [];
  for (const domain of domains) {
    const subdomainWeights = new Map<string, number>();
    const scores = new Map<string, number>();

    for (const subdomainId of domain.subdomainIds) {
      const subdomain = subdomains.find(s => s.id === subdomainId);
      const score = subdomainScores.get(subdomainId);

      if (subdomain && score !== undefined) {
        subdomainWeights.set(subdomainId, subdomain.weight);
        scores.set(subdomainId, score);
      }
    }

    const domainScore = computeDomainScore({
      domainId: domain.id,
      candidateId,
      subdomainScores: scores,
      subdomainWeights,
    });

    if (domainScore) {
      domainScores.push(domainScore.score);
    }
  }

  // Step 3: Compute global score
  const globalScore = computeGlobalScore({
    candidateId,
    domainScores,
  });

  return {
    candidateId,
    subdomainScores: Object.fromEntries(subdomainScores),
    domainScores,
    globalScore: globalScore?.score ?? null,
  };
}