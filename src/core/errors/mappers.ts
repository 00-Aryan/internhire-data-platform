// src/core/errors/mappers.ts
// Map domain errors to different contexts (HTTP, UI, logs)

import { DomainError, getErrorMessage, getErrorCode } from './DomainError';
import { InfrastructureError } from './InfrastructureError';

/**
 * HTTP error response shape
 */
export interface HttpErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
  };
}

/**
 * Map any error to HTTP response
 * 
 * Rules:
 * - Domain errors → mapped status code + safe message
 * - Infrastructure errors → 500 + generic message
 * - Unknown errors → 500 + generic message
 */
export function toHttpError(error: unknown): {
  statusCode: number;
  body: HttpErrorResponse;
} {
  // Domain errors (expected)
  if (error instanceof DomainError) {
    return {
      statusCode: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.getUserMessage(),
          details: error.context,
          timestamp: error.timestamp.toISOString(),
        },
      },
    };
  }

  // Infrastructure errors (unexpected)
  if (error instanceof InfrastructureError) {
    return {
      statusCode: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.getUserMessage(), // Generic message
          timestamp: error.timestamp.toISOString(),
        },
      },
    };
  }

  // Unknown errors (should never happen, but defensive)
  console.error('Unhandled error type:', error);
  return {
    statusCode: 500,
    body: {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
    },
  };
}

/**
 * UI error shape (safe for display)
 */
export interface UiError {
  title: string;
  message: string;
  action?: string; // Suggested user action
  canRetry: boolean;
}

/**
 * Map any error to UI-friendly format
 * 
 * Rules:
 * - Safe messages only
 * - Actionable guidance
 * - No stack traces or internal details
 */
export function toUiError(error: unknown): UiError {
  if (error instanceof DomainError) {
    return {
      title: getErrorTitle(error),
      message: error.getUserMessage(),
      action: getErrorAction(error),
      canRetry: false, // Domain errors usually require user correction
    };
  }

  if (error instanceof InfrastructureError) {
    return {
      title: 'Service Unavailable',
      message: error.getUserMessage(),
      action: 'Please try again in a moment',
      canRetry: true, // Infrastructure errors might be transient
    };
  }

  return {
    title: 'Something went wrong',
    message: 'An unexpected error occurred',
    action: 'Please try again or contact support',
    canRetry: true,
  };
}

/**
 * Get user-friendly error title
 */
function getErrorTitle(error: DomainError): string {
  const titles: Record<string, string> = {
    VALIDATION_ERROR: 'Invalid Input',
    AUTHENTICATION_ERROR: 'Authentication Required',
    AUTHORIZATION_ERROR: 'Permission Denied',
    NOT_FOUND: 'Not Found',
    ALREADY_EXISTS: 'Already Exists',
    BUSINESS_LOGIC_ERROR: 'Operation Not Allowed',
    SCORING_ERROR: 'Scoring Error',
    INSUFFICIENT_SCORING_DATA: 'Incomplete Data',
    QUOTA_EXCEEDED: 'Limit Reached',
  };

  return titles[error.code] || 'Error';
}

/**
 * Get suggested user action
 */
function getErrorAction(error: DomainError): string | undefined {
  const actions: Record<string, string> = {
    AUTHENTICATION_ERROR: 'Please sign in to continue',
    AUTHORIZATION_ERROR: 'Contact an administrator for access',
    NOT_FOUND: 'Check the URL or try searching',
    VALIDATION_ERROR: 'Please correct the highlighted fields',
    QUOTA_EXCEEDED: 'Upgrade your plan or contact support',
    INSUFFICIENT_SCORING_DATA: 'Complete all required assessments',
  };

  return actions[error.code];
}

/**
 * Logging error shape (includes all details)
 */
export interface LogError {
  level: 'error' | 'warn' | 'info';
  code: string;
  message: string;
  context?: Record<string, unknown>;
  stack?: string;
  timestamp: string;
  userId?: string;
  requestId?: string;
}

/**
 * Map any error to structured log
 * 
 * Rules:
 * - Include all context for debugging
 * - Sanitize sensitive data
 * - Add request context if available
 */
export function toLogError(
  error: unknown,
  additionalContext?: {
    userId?: string;
    requestId?: string;
  }
): LogError {
  const baseLog: LogError = {
    level: 'error',
    code: getErrorCode(error),
    message: getErrorMessage(error),
    timestamp: new Date().toISOString(),
    ...additionalContext,
  };

  if (error instanceof DomainError) {
    return {
      ...baseLog,
      level: error.statusCode >= 500 ? 'error' : 'warn',
      context: error.context,
      stack: error.stack,
    };
  }

  if (error instanceof InfrastructureError) {
    return {
      ...baseLog,
      level: 'error',
      context: error.context,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      ...baseLog,
      stack: error.stack,
    };
  }

  return baseLog;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof InfrastructureError) {
    return true; // Infrastructure errors might be transient
  }

  if (error instanceof DomainError) {
    // Rate limits are retryable
    return error.code === 'RATE_LIMIT_EXCEEDED';
  }

  return false;
}

/**
 * Extract retry delay if applicable
 */
export function getRetryDelay(error: unknown): number | undefined {
  if (error instanceof InfrastructureError && 'retryAfter' in error) {
    return (error as any).retryAfter;
  }
  return undefined;
}