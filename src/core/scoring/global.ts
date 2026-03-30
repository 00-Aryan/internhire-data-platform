// src/core/scoring/global.ts
// Global scoring logic (aggregates domains)

import { GlobalContext, AggregatedScore, ScoringResult } from './types';
import { computeSimpleAverage } from './weighting';

/**
 * Compute global score for a single candidate
 * 
 * Business Flow:
 * 1. Collect all domain scores for the candidate
 * 2. Compute simple average (equal weights)
 * 
 * Business Rule: Requires at least 1 domain score
 * 
 * @param context - Global context with domain scores
 * @returns Aggregated global score or null
 */
export function computeGlobalScore(context: GlobalContext): AggregatedScore | null {
  const { candidateId, domainScores } = context;

  // Validate we have scores
  if (domainScores.length === 0) {
    return null;
  }

  const averageScore = computeSimpleAverage(domainScores);

  if (averageScore === null) {
    return null;
  }

  return {
    candidateId,
    score: averageScore,
    componentsUsed: domainScores.length,
  };
}

/**
 * Batch compute global scores for multiple candidates
 * 
 * @param contexts - Array of global contexts
 * @returns Array of successful aggregated scores
 */
export function batchComputeGlobalScores(contexts: GlobalContext[]): AggregatedScore[] {
  const results: AggregatedScore[] = [];

  for (const context of contexts) {
    const score = computeGlobalScore(context);
    if (score !== null) {
      results.push(score);
    }
  }

  return results;
}

/**
 * Compute global score from domain score values directly
 * 
 * Helper function for simple cases
 * 
 * @param candidateId - Candidate identifier
 * @param domainScores - Array of domain score values
 * @returns Aggregated score or null
 */
export function computeCandidateGlobalScore(
  candidateId: string,
  domainScores: number[]
): AggregatedScore | null {
  return computeGlobalScore({ candidateId, domainScores });
}

/**
 * Validate global scoring context
 * 
 * @param context - Global context to validate
 * @returns Validation result
 */
export function validateGlobalContext(context: GlobalContext): ScoringResult<void> {
  if (!context.candidateId) {
    return {
      success: false,
      error: {
        type: 'INVALID_INPUT',
        message: 'Missing candidateId',
      },
    };
  }

  if (context.domainScores.length === 0) {
    return {
      success: false,
      error: {
        type: 'INSUFFICIENT_DATA',
        message: `No domain scores for candidate ${context.candidateId}`,
      },
    };
  }

  return { success: true, data: undefined };
}

/**
 * Compute global score with confidence metric
 * 
 * Confidence = number of domains with scores / total possible domains
 * 
 * @param candidateId - Candidate identifier
 * @param domainScores - Array of domain scores
 * @param totalPossibleDomains - Total number of domains in system
 * @returns Score with confidence or null
 */
export function computeGlobalScoreWithConfidence(
  candidateId: string,
  domainScores: number[],
  totalPossibleDomains: number
): { score: number; confidence: number } | null {
  const result = computeCandidateGlobalScore(candidateId, domainScores);

  if (!result) {
    return null;
  }

  const confidence = domainScores.length / totalPossibleDomains;

  return {
    score: result.score,
    confidence: Math.min(confidence, 1.0), // Cap at 100%
  };
}