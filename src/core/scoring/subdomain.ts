// src/core/scoring/subdomain.ts
// Subdomain-level scoring logic

import { RawScore, DerivedScore, ScoringResult, SubdomainContext } from './types';
import { computeStatistics, transformToZScore, zScoreToPercentile } from './statistics';
import { percentileToScore } from './normalization';

/**
 * Compute derived score for a single candidate within a subdomain
 * 
 * Pipeline: raw score → z-score → percentile → normalized score
 * 
 * @param rawScore - Original score value
 * @param stats - Subdomain statistical context
 * @returns Derived score object
 */
export function computeSubdomainScore(
  candidateId: string,
  rawScore: number,
  stats: { mean: number; standardDeviation: number }
): DerivedScore {
  const zScore = transformToZScore(rawScore, { ...stats, count: 1 });
  const percentile = zScoreToPercentile(zScore);
  const normalizedScore = percentileToScore(percentile);

  return {
    candidateId,
    zScore,
    percentile,
    normalizedScore,
  };
}

/**
 * Process all candidates for a single subdomain
 * 
 * Business Flow:
 * 1. Compute statistics (μ, σ) for the subdomain
 * 2. Transform each raw score using shared stats
 * 3. Return derived scores for all candidates
 * 
 * @param context - Subdomain context with raw scores
 * @returns Array of derived scores or error
 */
export function processSubdomain(
  context: SubdomainContext
): ScoringResult<DerivedScore[]> {
  const { subdomainId, rawScores } = context;

  // Validate input
  if (rawScores.length === 0) {
    return {
      success: false,
      error: {
        type: 'INSUFFICIENT_DATA',
        message: `No raw scores found for subdomain ${subdomainId}`,
      },
    };
  }

  // Compute statistics for the subdomain
  const values = rawScores.map(s => s.value);
  const stats = computeStatistics(values);

  if (!stats) {
    return {
      success: false,
      error: {
        type: 'COMPUTATION_ERROR',
        message: `Failed to compute statistics for subdomain ${subdomainId}`,
      },
    };
  }

  // Transform all raw scores
  const derivedScores = rawScores.map(raw =>
    computeSubdomainScore(raw.candidateId, raw.value, stats)
  );

  return {
    success: true,
    data: derivedScores,
  };
}

/**
 * Batch process multiple subdomains
 * 
 * Optimization: Independent subdomain processing allows parallelization
 * 
 * @param contexts - Array of subdomain contexts
 * @returns Map of subdomainId -> derived scores
 */
export function batchProcessSubdomains(
  contexts: SubdomainContext[]
): Map<string, DerivedScore[]> {
  const results = new Map<string, DerivedScore[]>();

  for (const context of contexts) {
    const result = processSubdomain(context);
    if (result.success) {
      results.set(context.subdomainId, result.data);
    }
  }

  return results;
}

/**
 * Get derived score for a specific candidate in a subdomain
 * 
 * @param derivedScores - All derived scores for the subdomain
 * @param candidateId - Target candidate
 * @returns Derived score or null if not found
 */
export function getScoreForCandidate(
  derivedScores: DerivedScore[],
  candidateId: string
): DerivedScore | null {
  return derivedScores.find(s => s.candidateId === candidateId) ?? null;
}