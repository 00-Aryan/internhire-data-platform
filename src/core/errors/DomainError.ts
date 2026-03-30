// src/core/errors/DomainError.ts
// Base domain error class - represents business rule violations

/**
 * Base class for all domain errors
 * 
 * Domain errors represent violations of business rules, not infrastructure failures.
 * They should be:
 * - Safe to show to users (after mapping)
 * - Loggable with context
 * - Distinguishable from infrastructure errors
 */
export abstract class DomainError extends Error {
  /**
   * Machine-readable error code for clients
   */
  abstract readonly code: string; // Subclasses can override with literal types

  /**
   * HTTP status code this error maps to (if applicable)
   */
  abstract readonly statusCode: number;

  /**
   * Additional context for logging/debugging
   */
  readonly context?: Record<string, unknown>;

  /**
   * Timestamp when error occurred
   */
  readonly timestamp: Date;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize error for logging
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * Get safe message for end users (override for custom behavior)
   */
  getUserMessage(): string {
    return this.message;
  }

  /**
   * Check if error is a domain error
   */
  static isDomainError(error: unknown): error is DomainError {
    return error instanceof DomainError;
  }
}

/**
 * Type guard for domain errors
 */
export function isDomainError(error: unknown): error is DomainError {
  return DomainError.isDomainError(error);
}

/**
 * Extract error message safely from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof DomainError) {
    return error.getUserMessage();
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Extract error code safely from any error type
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof DomainError) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
}