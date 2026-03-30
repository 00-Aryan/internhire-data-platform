// src/core/errors/BusinessLogicError.ts
// Business rule violations

import { DomainError } from './DomainError';

/**
 * Business logic error - represents violation of business rules
 * 
 * Use when:
 * - State transition is invalid
 * - Business constraint violated
 * - Resource in wrong state for operation
 */
export class BusinessLogicError extends DomainError {
  readonly code: string = 'BUSINESS_LOGIC_ERROR';
  readonly statusCode = 422; // Unprocessable Entity

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * Resource not found - requested entity doesn't exist
 */
export class NotFoundError extends DomainError {
  override readonly code = 'NOT_FOUND' as const;
  readonly statusCode = 404;

  readonly resourceType: string;
  readonly resourceId: string;

  constructor(resourceType: string, resourceId: string, context?: Record<string, unknown>) {
    super(`${resourceType} with ID '${resourceId}' not found`, {
      ...context,
      resourceType,
      resourceId,
    });
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  getUserMessage(): string {
    return `The requested ${this.resourceType} could not be found`;
  }
}

/**
 * Resource already exists - duplicate creation attempt
 */
export class AlreadyExistsError extends DomainError {
  override readonly code = 'ALREADY_EXISTS' as const;
  readonly statusCode = 409; // Conflict

  readonly resourceType: string;
  readonly conflictingField?: string;

  constructor(
    resourceType: string,
    conflictingField?: string,
    context?: Record<string, unknown>
  ) {
    const fieldMsg = conflictingField ? ` with this ${conflictingField}` : '';
    super(`${resourceType}${fieldMsg} already exists`, {
      ...context,
      resourceType,
      conflictingField,
    });
    this.resourceType = resourceType;
    this.conflictingField = conflictingField;
  }
}

/**
 * Invalid state transition
 */
export class InvalidStateTransitionError extends BusinessLogicError {
  override readonly code = 'INVALID_STATE_TRANSITION' as const;

  readonly currentState: string;
  readonly attemptedState: string;

  constructor(
    resourceType: string,
    currentState: string,
    attemptedState: string,
    context?: Record<string, unknown>
  ) {
    super(
      `Cannot transition ${resourceType} from '${currentState}' to '${attemptedState}'`,
      {
        ...context,
        resourceType,
        currentState,
        attemptedState,
      }
    );
    this.currentState = currentState;
    this.attemptedState = attemptedState;
  }
}

/**
 * Operation not allowed in current state
 */
export class InvalidOperationError extends BusinessLogicError {
  override readonly code = 'INVALID_OPERATION' as const;

  readonly operation: string;
  readonly currentState: string;

  constructor(
    operation: string,
    currentState: string,
    reason: string,
    context?: Record<string, unknown>
  ) {
    super(`Cannot ${operation}: ${reason}`, {
      ...context,
      operation,
      currentState,
      reason,
    });
    this.operation = operation;
    this.currentState = currentState;
  }
}

/**
 * Resource quota/limit exceeded
 */
export class QuotaExceededError extends BusinessLogicError {
  override readonly code = 'QUOTA_EXCEEDED' as const;

  readonly quotaType: string;
  readonly limit: number;
  readonly current: number;

  constructor(
    quotaType: string,
    limit: number,
    current: number,
    context?: Record<string, unknown>
  ) {
    super(
      `${quotaType} quota exceeded. Limit: ${limit}, Current: ${current}`,
      {
        ...context,
        quotaType,
        limit,
        current,
      }
    );
    this.quotaType = quotaType;
    this.limit = limit;
    this.current = current;
  }

  getUserMessage(): string {
    return `You have reached your ${this.quotaType} limit (${this.limit})`;
  }
}

/**
 * Dependency/prerequisite not met
 */
export class DependencyError extends BusinessLogicError {
  override readonly code = 'DEPENDENCY_ERROR' as const;

  readonly dependency: string;

  constructor(dependency: string, reason: string, context?: Record<string, unknown>) {
    super(`Dependency not met: ${dependency}. ${reason}`, {
      ...context,
      dependency,
      reason,
    });
    this.dependency = dependency;
  }
}