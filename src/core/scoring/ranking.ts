// src/core/scoring/ranking.ts
// Dense ranking algorithm

import { RankedScore } from './types';

/**
 * Scored entity for ranking (minimal interface)
 */
interface ScoredEntity {
  candidateId: string;
  score: number;
}

/**
 * Assign dense ranks to a list of scored entities
 * 
 * Business Rule: Dense ranking (ties get same rank, next rank is consecutive)
 * Example: [100, 95, 95, 90] → ranks [1, 2, 2, 3]
 * 
 * Algorithm:
 * 1. Sort by score DESC
 * 2. Assign rank 1 to highest score
 * 3. When score changes, increment rank
 * 4. Ties keep same rank
 * 
 * @param entities - Array of scored entities
 * @returns Array of ranked scores
 */
export function assignDenseRanks(entities: ScoredEntity[]): RankedScore[] {
  if (entities.length === 0) {
    return [];
  }

  // Sort by score descending (highest score = rank 1)
  const sorted = [...entities].sort((a, b) => b.score - a.score);

  const ranked: RankedScore[] = [];
  let currentRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    // If score decreased from previous, increment rank
    if (i > 0 && sorted[i].score < sorted[i - 1].score) {
      currentRank++;
    }

    ranked.push({
      candidateId: sorted[i].candidateId,
      score: sorted[i].score,
      rank: currentRank,
    });
  }

  return ranked;
}

/**
 * Get rank for a specific candidate from ranked list
 * 
 * @param rankedScores - Array of ranked scores
 * @param candidateId - Candidate to find
 * @returns Rank or null if not found
 */
export function getRankForCandidate(
  rankedScores: RankedScore[],
  candidateId: string
): number | null {
  const result = rankedScores.find(r => r.candidateId === candidateId);
  return result?.rank ?? null;
}

/**
 * Group entities by a key and rank within each group
 * 
 * Example: Rank candidates within each subdomain
 * 
 * @param entities - Array of entities with groupKey
 * @param getGroupKey - Function to extract group key
 * @returns Map of groupKey -> ranked scores
 */
export function rankWithinGroups<T extends ScoredEntity & { groupKey: string }>(
  entities: T[]
): Map<string, RankedScore[]> {
  const grouped = new Map<string, ScoredEntity[]>();

  // Group entities
  for (const entity of entities) {
    const key = entity.groupKey;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(entity);
  }

  // Rank within each group
  const rankedGroups = new Map<string, RankedScore[]>();
  for (const [key, group] of grouped.entries()) {
    rankedGroups.set(key, assignDenseRanks(group));
  }

  return rankedGroups;
}

/**
 * Get percentile rank (0-100) instead of ordinal rank
 * 
 * Formula: percentile = (1 - (rank - 1) / total) * 100
 * 
 * @param rank - Ordinal rank (1-based)
 * @param total - Total number of entities
 * @returns Percentile (0-100)
 */
export function rankToPercentile(rank: number, total: number): number {
  if (total <= 0 || rank < 1 || rank > total) {
    return 0;
  }
  return ((total - rank + 1) / total) * 100;
}