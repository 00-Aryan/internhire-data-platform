// src/core/errors/ScoringError.ts
// Scoring-specific domain errors

import { DomainError } from './DomainError';
import { BusinessLogicError } from './BusinessLogicError';

/**
 * Base scoring error
 */
export class ScoringError extends DomainError {
  readonly code: string = 'SCORING_ERROR';
  readonly statusCode = 422;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * Insufficient data to compute score
 */
export class InsufficientScoringDataError extends ScoringError {
  override readonly code = 'INSUFFICIENT_SCORING_DATA' as const;

  readonly candidateId: string;
  readonly requiredComponents: string[];
  readonly availableComponents: string[];

  constructor(
    candidateId: string,
    requiredComponents: string[],
    availableComponents: string[],
    context?: Record<string, unknown>
  ) {
    const missing = requiredComponents.filter(
      c => !availableComponents.includes(c)
    );
    super(
      `Cannot compute score: missing data for ${missing.join(', ')}`,
      {
        ...context,
        candidateId,
        requiredComponents,
        availableComponents,
        missing,
      }
    );
    this.candidateId = candidateId;
    this.requiredComponents = requiredComponents;
    this.availableComponents = availableComponents;
  }

  getUserMessage(): string {
    return 'Unable to compute score due to missing assessment data';
  }
}

/**
 * Invalid scoring configuration
 */
export class InvalidScoringConfigError extends ScoringError {
  override readonly code = 'INVALID_SCORING_CONFIG' as const;

  readonly configField: string;

  constructor(configField: string, reason: string, context?: Record<string, unknown>) {
    super(`Invalid scoring configuration: ${configField} - ${reason}`, {
      ...context,
      configField,
      reason,
    });
    this.configField = configField;
  }
}

/**
 * Score computation failed
 */
export class ScoreComputationError extends ScoringError {
  override readonly code = 'SCORE_COMPUTATION_ERROR' as const;

  readonly stage: 'subdomain' | 'domain' | 'global' | 'ranking';

  constructor(
    stage: 'subdomain' | 'domain' | 'global' | 'ranking',
    reason: string,
    context?: Record<string, unknown>
  ) {
    super(`Score computation failed at ${stage} stage: ${reason}`, {
      ...context,
      stage,
      reason,
    });
    this.stage = stage;
  }

  getUserMessage(): string {
    return 'An error occurred while computing scores. Please try again later.';
  }
}

/**
 * Invalid weight configuration
 */
export class InvalidWeightError extends ScoringError {
  override readonly code = 'INVALID_WEIGHT' as const;

  readonly componentId: string;
  readonly weight: number;

  constructor(componentId: string, weight: number, reason: string, context?: Record<string, unknown>) {
    super(`Invalid weight for ${componentId}: ${reason}`, {
      ...context,
      componentId,
      weight,
      reason,
    });
    this.componentId = componentId;
    this.weight = weight;
  }
}

/**
 * No scores available for candidate
 */
export class NoScoresAvailableError extends ScoringError {
  override readonly code = 'NO_SCORES_AVAILABLE' as const;

  readonly candidateId: string;

  constructor(candidateId: string, context?: Record<string, unknown>) {
    super(`No scores available for candidate ${candidateId}`, {
      ...context,
      candidateId,
    });
    this.candidateId = candidateId;
  }

  getUserMessage(): string {
    return 'No assessment scores are available yet';
  }
}

/**
 * Score already exists (duplicate computation)
 */
export class ScoreAlreadyExistsError extends BusinessLogicError {
  override readonly code = 'SCORE_ALREADY_EXISTS' as const;

  readonly candidateId: string;
  readonly scoreType: string;

  constructor(candidateId: string, scoreType: string, context?: Record<string, unknown>) {
    super(`${scoreType} score already exists for candidate ${candidateId}`, {
      ...context,
      candidateId,
      scoreType,
    });
    this.candidateId = candidateId;
    this.scoreType = scoreType;
  }
}