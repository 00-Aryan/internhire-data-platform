// src/core/scoring/weighting.ts
// Weighted aggregation logic

import { WeightedComponent, AggregatedScore } from './types';
import { roundScore, DEFAULT_SCORING_CONFIG } from './normalization';

/**
 * Compute weighted average from components
 * 
 * Business Rules:
 * - Ignores components with undefined values
 * - Requires at least 1 valid component (configurable)
 * - Returns null if insufficient data
 * - Rounds to 3 decimal places
 * 
 * @param components - Array of weighted components
 * @param minRequired - Minimum components needed (default: 1)
 * @returns Weighted average or null
 */
export function computeWeightedAverage(
  components: WeightedComponent[],
  minRequired: number = DEFAULT_SCORING_CONFIG.minComponentsRequired
): number | null {
  // Filter out invalid components
  const validComponents = components.filter(
    c => !isNaN(c.value) && !isNaN(c.weight) && c.weight > 0
  );

  if (validComponents.length < minRequired) {
    return null;
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const component of validComponents) {
    totalWeightedScore += component.value * component.weight;
    totalWeight += component.weight;
  }

  // Edge case: All weights are zero (shouldn't happen with validation above)
  if (totalWeight === 0) {
    return null;
  }

  const average = totalWeightedScore / totalWeight;
  return roundScore(average);
}

/**
 * Compute weighted score for a single candidate across multiple components
 * 
 * Example: Aggregating subdomain scores into a domain score
 * 
 * @param candidateId - Candidate identifier
 * @param scoresByComponent - Map of componentId -> score
 * @param weightsByComponent - Map of componentId -> weight
 * @returns Aggregated score result
 */
export function aggregateScoreForCandidate(
  candidateId: string,
  scoresByComponent: Map<string, number>,
  weightsByComponent: Map<string, number>
): AggregatedScore | null {
  const components: WeightedComponent[] = [];

  // Build component array by matching scores with weights
  for (const [componentId, weight] of weightsByComponent.entries()) {
    const score = scoresByComponent.get(componentId);
    if (score !== undefined) {
      components.push({ value: score, weight });
    }
  }

  const aggregatedScore = computeWeightedAverage(components);

  if (aggregatedScore === null) {
    return null;
  }

  return {
    candidateId,
    score: aggregatedScore,
    componentsUsed: components.length,
  };
}

/**
 * Compute simple average (equal weights)
 * 
 * Business Rule: Used for global scores (average of domain scores)
 * 
 * @param values - Array of numeric values
 * @returns Average or null if empty
 */
export function computeSimpleAverage(values: number[]): number | null {
  const validValues = values.filter(v => !isNaN(v));
  
  if (validValues.length === 0) {
    return null;
  }

  const sum = validValues.reduce((acc, val) => acc + val, 0);
  const average = sum / validValues.length;
  
  return roundScore(average);
}

/**
 * Compute custom weighted combination score
 * 
 * Used for API requests with dynamic weights
 * 
 * @param scoresByComponent - Map of componentId -> score
 * @param customWeights - Map of componentId -> custom weight
 * @returns Weighted score or null
 */
export function computeCustomCombination(
  scoresByComponent: Map<string, number>,
  customWeights: Map<string, number>
): number | null {
  const components: WeightedComponent[] = [];

  for (const [componentId, weight] of customWeights.entries()) {
    const score = scoresByComponent.get(componentId);
    if (score !== undefined && weight > 0) {
      components.push({ value: score, weight });
    }
  }

  return computeWeightedAverage(components);
}