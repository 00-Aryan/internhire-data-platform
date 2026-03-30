// src/core/errors/handlers.ts
// Error handling utilities for different contexts

import { NextRequest, NextResponse } from 'next/server';
import { toHttpError, toLogError } from './mappers';
import { DomainError } from './DomainError';

/**
 * Global error handler for API routes
 * 
 * Usage:
 * ```typescript
 * export async function POST(req: NextRequest) {
 *   return withErrorHandling(req, async () => {
 *     // Your logic here
 *     throw new ValidationError('Invalid input');
 *   });
 * }
 * ```
 */
export async function withErrorHandling<T>(
  req: NextRequest,
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    const result = await handler();
    
    // If result is already a Response, return it
    if (result instanceof NextResponse) {
      return result;
    }
    
    // Otherwise, wrap in JSON response
    return NextResponse.json(result);
  } catch (error) {
    // Log the error (with request context)
    const logError = toLogError(error, {
      requestId: req.headers.get('x-request-id') ?? undefined,
      userId: extractUserId(req),
    });
    
    console.error('API Error:', logError);
    
    // Map to HTTP response
    const { statusCode, body } = toHttpError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

/**
 * Extract user ID from request (helper)
 */
function extractUserId(req: NextRequest): string | undefined {
  // Adjust based on your auth implementation
  // Example: JWT in cookie or header
  try {
    const token = req.cookies.get('session')?.value;
    if (token) {
      // Parse token to get userId
      // This is implementation-specific
      return undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Error boundary for React Server Components
 * 
 * Usage:
 * ```typescript
 * export default async function Page() {
 *   const data = await serverActionWithErrorBoundary(async () => {
 *     return await fetchData();
 *   });
 *   return <div>{data}</div>;
 * }
 * ```
 */
export async function serverActionWithErrorBoundary<T>(
  action: () => Promise<T>
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    // Log error
    console.error('Server Action Error:', toLogError(error));
    
    // Re-throw domain errors (they should be caught by UI)
    if (error instanceof DomainError) {
      throw error;
    }
    
    // Convert infrastructure errors to generic domain error
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Async operation wrapper with error transformation
 * 
 * Catches errors and transforms them to domain errors
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorTransform: (error: unknown) => DomainError
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof DomainError) {
      throw error; // Already a domain error
    }
    throw errorTransform(error); // Transform to domain error
  }
}

/**
 * Validate and throw appropriate error
 * 
 * Usage:
 * ```typescript
 * validate(!!userId, new ValidationError('User ID required'));
 * ```
 */
export function validate(
  condition: boolean,
  error: DomainError
): asserts condition {
  if (!condition) {
    throw error;
  }
}

/**
 * Assert non-null or throw
 * 
 * Usage:
 * ```typescript
 * const user = assertExists(
 *   await findUser(id),
 *   new NotFoundError('User', id)
 * );
 * ```
 */
export function assertExists<T>(
  value: T | null | undefined,
  error: DomainError
): T {
  if (value === null || value === undefined) {
    throw error;
  }
  return value;
}

/**
 * Try-catch wrapper with default value
 * 
 * Usage:
 * ```typescript
 * const score = tryOr(() => computeScore(data), 0);
 * ```
 */
export function tryOr<T>(operation: () => T, defaultValue: T): T {
  try {
    return operation();
  } catch {
    return defaultValue;
  }
}

/**
 * Async try-catch wrapper with default value
 */
export async function tryOrAsync<T>(
  operation: () => Promise<T>,
  defaultValue: T
): Promise<T> {
  try {
    return await operation();
  } catch {
    return defaultValue;
  }
}

/**
 * Retry with exponential backoff
 * 
 * Usage:
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => fetchExternalApi(),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!shouldRetry(error)) {
        throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  throw lastError;
}