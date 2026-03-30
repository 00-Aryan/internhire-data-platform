// src/core/scoring/types.ts
// Pure domain types for the scoring engine
// No framework dependencies, no Prisma, no HTTP

/**
 * Raw score input from a data source
 */
export interface RawScore {
  candidateId: string;
  value: number;
}

/**
 * Statistical summary for a score distribution
 */
export interface ScoreStatistics {
  mean: number;
  standardDeviation: number;
  count: number;
}

/**
 * Derived score after statistical transformation
 */
export interface DerivedScore {
  candidateId: string;
  zScore: number;
  percentile: number;
  normalizedScore: number; // 0.000 to 99.999
}

/**
 * Weighted score component
 */
export interface WeightedComponent {
  value: number;
  weight: number;
}

/**
 * Result of weighted aggregation
 */
export interface AggregatedScore {
  candidateId: string;
  score: number;
  componentsUsed: number; // How many components had data
}

/**
 * Ranked entity with score and position
 */
export interface RankedScore {
  candidateId: string;
  score: number;
  rank: number; // Dense rank (1-based)
}

/**
 * Configuration for score computation
 */
export interface ScoringConfig {
  decimalPrecision: number; // Default: 3
  scoreScale: number; // Default: 99.999
  minComponentsRequired: number; // Default: 1
}

/**
 * Subdomain scoring context
 */
export interface SubdomainContext {
  subdomainId: string;
  rawScores: RawScore[];
}

/**
 * Domain scoring context with weighted subdomains
 */
export interface DomainContext {
  domainId: string;
  candidateId: string;
  subdomainScores: Map<string, number>; // subdomainId -> score
  subdomainWeights: Map<string, number>; // subdomainId -> weight
}

/**
 * Global scoring context
 */
export interface GlobalContext {
  candidateId: string;
  domainScores: number[];
}

/**
 * Error types for scoring operations
 */
export type ScoringError =
  | { type: 'INSUFFICIENT_DATA'; message: string }
  | { type: 'INVALID_INPUT'; message: string }
  | { type: 'COMPUTATION_ERROR'; message: string };

/**
 * Result type for scoring operations
 */
export type ScoringResult<T> =
  | { success: true; data: T }
  | { success: false; error: ScoringError };