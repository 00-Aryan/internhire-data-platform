// src/core/errors/InfrastructureError.ts
// Infrastructure/external system failures

import { DomainError } from './DomainError';

/**
 * Infrastructure error - external system failures
 * 
 * Use when:
 * - Database connection fails
 * - External API fails
 * - File system errors
 * - Network errors
 * 
 * Note: These are NOT domain errors, but we include them in the
 * error hierarchy for consistent error handling.
 */
export class InfrastructureError extends Error {
  readonly code: string = 'INFRASTRUCTURE_ERROR';
  readonly statusCode: number = 500;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Never expose internal details to users
   */
  getUserMessage(): string {
    return 'An internal error occurred. Please try again later.';
  }

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
}

/**
 * Database operation failed
 */
export class DatabaseError extends InfrastructureError {
  override readonly code = 'DATABASE_ERROR' as const;

  readonly operation: string;

  constructor(operation: string, cause: Error, context?: Record<string, unknown>) {
    super(`Database ${operation} failed: ${cause.message}`, {
      ...context,
      operation,
      originalError: cause.message,
    });
    this.operation = operation;
  }
}

/**
 * External service unavailable
 */
export class ExternalServiceError extends InfrastructureError {
  override readonly code = 'EXTERNAL_SERVICE_ERROR' as const;

  readonly serviceName: string;

  constructor(serviceName: string, reason: string, context?: Record<string, unknown>) {
    super(`External service '${serviceName}' failed: ${reason}`, {
      ...context,
      serviceName,
      reason,
    });
    this.serviceName = serviceName;
  }
}

/**
 * Network/timeout error
 */
export class NetworkError extends InfrastructureError {
  override readonly code = 'NETWORK_ERROR' as const;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * Rate limit exceeded (external or internal)
 */
export class RateLimitError extends InfrastructureError {
  override readonly code = 'RATE_LIMIT_EXCEEDED' as const;
  override readonly statusCode = 429;

  readonly retryAfter?: number; // seconds

  constructor(retryAfter?: number, context?: Record<string, unknown>) {
    super('Rate limit exceeded', {
      ...context,
      retryAfter,
    });
    this.retryAfter = retryAfter;
  }

  getUserMessage(): string {
    if (this.retryAfter) {
      return `Too many requests. Please try again in ${this.retryAfter} seconds.`;
    }
    return 'Too many requests. Please try again later.';
  }
}

/**
 * File system error
 */
export class FileSystemError extends InfrastructureError {
  override readonly code = 'FILE_SYSTEM_ERROR' as const;

  readonly operation: string;
  readonly path: string;

  constructor(operation: string, path: string, cause: Error, context?: Record<string, unknown>) {
    super(`File system ${operation} failed for ${path}: ${cause.message}`, {
      ...context,
      operation,
      path,
      originalError: cause.message,
    });
    this.operation = operation;
    this.path = path;
  }
}