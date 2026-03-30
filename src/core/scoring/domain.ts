// src/core/scoring/domain.ts
// Domain-level scoring logic (aggregates subdomains)

import { DomainContext, AggregatedScore, ScoringResult } from './types';
import { aggregateScoreForCandidate } from './weighting';

/**
 * Compute domain score for a single candidate
 * 
 * Business Flow:
 * 1. Fetch subdomain scores for this candidate
 * 2. Apply subdomain weights
 * 3. Compute weighted average
 * 
 * Business Rule: Requires at least 1 subdomain score
 * 
 * @param context - Domain context with subdomain scores and weights
 * @returns Aggregated domain score or null
 */
export function computeDomainScore(context: DomainContext): AggregatedScore | null {
  const { candidateId, subdomainScores, subdomainWeights } = context;

  // Validate we have scores
  if (subdomainScores.size === 0) {
    return null;
  }

  // Aggregate using weighted average
  return aggregateScoreForCandidate(candidateId, subdomainScores, subdomainWeights);
}

/**
 * Batch compute domain scores for multiple candidates
 * 
 * @param contexts - Array of domain contexts
 * @returns Array of successful aggregated scores
 */
export function batchComputeDomainScores(contexts: DomainContext[]): AggregatedScore[] {
  const results: AggregatedScore[] = [];

  for (const context of contexts) {
    const score = computeDomainScore(context);
    if (score !== null) {
      results.push(score);
    }
  }

  return results;
}

/**
 * Compute domain score for a candidate across all their subdomains
 * 
 * Helper function that structures the computation
 * 
 * @param candidateId - Candidate identifier
 * @param domainId - Domain identifier
 * @param subdomainData - Array of {subdomainId, score, weight}
 * @returns Aggregated score or null
 */
export function computeCandidateDomainScore(
  candidateId: string,
  domainId: string,
  subdomainData: Array<{ subdomainId: string; score: number; weight: number }>
): AggregatedScore | null {
  const subdomainScores = new Map<string, number>();
  const subdomainWeights = new Map<string, number>();

  for (const item of subdomainData) {
    subdomainScores.set(item.subdomainId, item.score);
    subdomainWeights.set(item.subdomainId, item.weight);
  }

  return computeDomainScore({
    domainId,
    candidateId,
    subdomainScores,
    subdomainWeights,
  });
}

/**
 * Validate domain scoring context
 * 
 * @param context - Domain context to validate
 * @returns Validation result
 */
export function validateDomainContext(context: DomainContext): ScoringResult<void> {
  if (!context.candidateId || !context.domainId) {
    return {
      success: false,
      error: {
        type: 'INVALID_INPUT',
        message: 'Missing candidateId or domainId',
      },
    };
  }

  if (context.subdomainScores.size === 0) {
    return {
      success: false,
      error: {
        type: 'INSUFFICIENT_DATA',
        message: `No subdomain scores for candidate ${context.candidateId} in domain ${context.domainId}`,
      },
    };
  }

  if (context.subdomainWeights.size === 0) {
    return {
      success: false,
      error: {
        type: 'INVALID_INPUT',
        message: `No subdomain weights defined for domain ${context.domainId}`,
      },
    };
  }

  return { success: true, data: undefined };
}