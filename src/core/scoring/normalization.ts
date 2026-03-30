// src/core/scoring/normalization.ts
// Score scale transformations and formatting

import { normalizeScore } from '@/shared/utils/math';

/**
 * Default scoring configuration
 */
export const DEFAULT_SCORING_CONFIG = {
  decimalPrecision: 3,
  scoreScale: 99.999,
  minComponentsRequired: 1,
} as const;

/**
 * Normalize percentile to display score (0.000 to 99.999)
 * 
 * Business Rule: 3 decimal places, scale to 99.999
 * 
 * @param percentile - Value between 0.0 and 1.0
 * @param scale - Maximum score value (default: 99.999)
 * @returns Normalized score
 */
export function percentileToScore(
  percentile: number,
  scale: number = DEFAULT_SCORING_CONFIG.scoreScale
): number {
  return normalizeScore(percentile);
}

/**
 * Round score to specified decimal precision
 * 
 * Business Rule: Always round to 3 decimal places
 * 
 * @param score - Raw score value
 * @param precision - Number of decimal places (default: 3)
 * @returns Rounded score
 */
export function roundScore(
  score: number,
  precision: number = DEFAULT_SCORING_CONFIG.decimalPrecision
): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(score * multiplier) / multiplier;
}

/**
 * Format score as zero-padded string "00.000" to "99.999"
 * 
 * Used for display/export consistency
 * 
 * @param score - Numeric score
 * @returns Formatted string
 */
export function formatScore(score: number): string {
  return score.toFixed(DEFAULT_SCORING_CONFIG.decimalPrecision).padStart(6, '0');
}

/**
 * Validate score is within acceptable range
 * 
 * @param score - Score to validate
 * @param min - Minimum value (default: 0)
 * @param max - Maximum value (default: 99.999)
 * @returns True if valid
 */
export function isValidScore(
  score: number,
  min: number = 0,
  max: number = DEFAULT_SCORING_CONFIG.scoreScale
): boolean {
  return !isNaN(score) && score >= min && score <= max;
}

/**
 * Clamp score to valid range
 * 
 * @param score - Score to clamp
 * @param min - Minimum value (default: 0)
 * @param max - Maximum value (default: 99.999)
 * @returns Clamped score
 */
export function clampScore(
  score: number,
  min: number = 0,
  max: number = DEFAULT_SCORING_CONFIG.scoreScale
): number {
  if (isNaN(score)) return min;
  return Math.max(min, Math.min(max, score));
}