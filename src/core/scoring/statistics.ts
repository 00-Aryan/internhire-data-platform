// src/core/scoring/statistics.ts
// Pure statistical functions for score transformations
// Reuses math utilities, adds domain-specific logic

import { computeZ, normalCdf } from '@/shared/utils/math';
import { ScoreStatistics, RawScore } from './types';

/**
 * Compute statistical summary (mean, standard deviation) for a set of scores
 * 
 * Business Rule: Requires at least 1 score
 * 
 * @param scores - Array of raw scores
 * @returns Statistical summary or null if insufficient data
 */
export function computeStatistics(scores: number[]): ScoreStatistics | null {
  if (scores.length === 0) {
    return null;
  }

  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  const variance = scores.reduce((sum, score) => {
    return sum + Math.pow(score - mean, 2);
  }, 0) / scores.length;
  
  const standardDeviation = Math.sqrt(variance);

  return {
    mean,
    standardDeviation,
    count: scores.length,
  };
}

/**
 * Transform a raw score using z-score normalization
 * 
 * Business Rule: If σ = 0, z-score = 0 (all scores identical)
 * 
 * @param rawScore - Original score value
 * @param stats - Statistical context (μ, σ)
 * @returns Z-score
 */
export function transformToZScore(rawScore: number, stats: ScoreStatistics): number {
  return computeZ(rawScore, stats.mean, stats.standardDeviation);
}

/**
 * Convert z-score to percentile using normal CDF
 * 
 * @param zScore - Standardized score
 * @returns Percentile (0.0 to 1.0)
 */
export function zScoreToPercentile(zScore: number): number {
  return normalCdf(zScore);
}

/**
 * Full transformation pipeline: raw → z-score → percentile
 * 
 * @param rawScore - Original score
 * @param stats - Statistical context
 * @returns Object with z-score and percentile
 */
export function transformScore(rawScore: number, stats: ScoreStatistics) {
  const zScore = transformToZScore(rawScore, stats);
  const percentile = zScoreToPercentile(zScore);
  
  return { zScore, percentile };
}

/**
 * Batch transform multiple scores using shared statistics
 * 
 * Optimization: Compute stats once, transform all scores
 * 
 * @param rawScores - Array of raw score objects
 * @returns Array of transformed scores or null if no valid stats
 */
export function batchTransformScores(rawScores: RawScore[]) {
  const values = rawScores.map(s => s.value);
  const stats = computeStatistics(values);
  
  if (!stats) {
    return null;
  }

  return rawScores.map(raw => {
    const { zScore, percentile } = transformScore(raw.value, stats);
    return {
      candidateId: raw.candidateId,
      zScore,
      percentile,
    };
  });
}