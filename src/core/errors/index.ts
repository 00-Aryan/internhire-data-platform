// src/core/errors/index.ts
// Central export for all error types and utilities

// ============================================================================
// BASE ERROR TYPES
// ============================================================================
export {
  DomainError,
  isDomainError,
  getErrorMessage,
  getErrorCode,
} from './DomainError';

// ============================================================================
// VALIDATION ERRORS
// ============================================================================
export {
  ValidationError,
  MissingFieldError,
  InvalidFormatError,
  OutOfRangeError,
  InvalidEnumValueError,
} from './ValidationError';

// ============================================================================
// AUTHORIZATION ERRORS
// ============================================================================
export {
  AuthenticationError,
  AuthorizationError,
  InsufficientPermissionsError,
  ResourceOwnershipError,
  RoleRequiredError,
  AccountStatusError,
} from './AuthorizationError';

// ============================================================================
// BUSINESS LOGIC ERRORS
// ============================================================================
export {
  BusinessLogicError,
  NotFoundError,
  AlreadyExistsError,
  InvalidStateTransitionError,
  InvalidOperationError,
  QuotaExceededError,
  DependencyError,
} from './BusinessLogicError';

// ============================================================================
// SCORING ERRORS
// ============================================================================
export {
  ScoringError,
  InsufficientScoringDataError,
  InvalidScoringConfigError,
  ScoreComputationError,
  InvalidWeightError,
  NoScoresAvailableError,
  ScoreAlreadyExistsError,
} from './ScoringError';

// ============================================================================
// INFRASTRUCTURE ERRORS
// ============================================================================
export {
  InfrastructureError,
  DatabaseError,
  ExternalServiceError,
  NetworkError,
  RateLimitError,
  FileSystemError,
} from './InfrastructureError';

// ============================================================================
// ERROR MAPPERS
// ============================================================================
export {
  toHttpError,
  toUiError,
  toLogError,
  isRetryableError,
  getRetryDelay,
  type HttpErrorResponse,
  type UiError,
  type LogError,
} from './mappers';

// ============================================================================
// ERROR HANDLERS
// ============================================================================
export {
  withErrorHandling,
  serverActionWithErrorBoundary,
  safeAsync,
  validate,
  assertExists,
  tryOr,
  tryOrAsync,
  retryWithBackoff,
} from './handlers';

// ============================================================================
// COMMON PATTERNS
// ============================================================================

/**
 * Create a NotFoundError for common resources
 */
export const notFound = {
  candidate: (id: string) => new (require('./BusinessLogicError').NotFoundError)('Candidate', id),
  job: (id: string) => new (require('./BusinessLogicError').NotFoundError)('Job', id),
  application: (id: string) => new (require('./BusinessLogicError').NotFoundError)('Application', id),
  recruiter: (id: string) => new (require('./BusinessLogicError').NotFoundError)('Recruiter', id),
  score: (id: string) => new (require('./BusinessLogicError').NotFoundError)('Score', id),
};

/**
 * Create authorization errors for common scenarios
 */
export const unauthorized = {
  notSignedIn: () => new (require('./AuthorizationError').AuthenticationError)(),
  insufficientPermissions: (action: string, resource: string) =>
    new (require('./AuthorizationError').InsufficientPermissionsError)(action, resource),
  notResourceOwner: (resourceType: string, resourceId: string) =>
    new (require('./AuthorizationError').ResourceOwnershipError)(resourceType, resourceId),
  roleRequired: (role: string) =>
    new (require('./AuthorizationError').RoleRequiredError)(role),
};

/**
 * Create validation errors for common scenarios
 */
export const invalid = {
  missingField: (field: string) => new (require('./ValidationError').MissingFieldError)(field),
  invalidFormat: (field: string, expected: string) =>
    new (require('./ValidationError').InvalidFormatError)(field, expected),
  outOfRange: (field: string, min: number, max: number, actual: number) =>
    new (require('./ValidationError').OutOfRangeError)(field, min, max, actual),
  invalidEnum: (field: string, allowed: string[], actual: string) =>
    new (require('./ValidationError').InvalidEnumValueError)(field, allowed, actual),
};