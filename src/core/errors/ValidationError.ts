// src/core/errors/ValidationError.ts
// Input validation failures

import { DomainError } from './DomainError';

/**
 * Validation error - represents invalid input data
 * 
 * Use when:
 * - User input doesn't meet schema requirements
 * - Required fields are missing
 * - Data format is incorrect
 * - Business constraints are violated
 */
export class ValidationError extends DomainError {
  readonly code: string = 'VALIDATION_ERROR'; // Not abstract anymore
  readonly statusCode = 400; // Bad Request

  /**
   * Field-specific validation errors
   */
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    context?: Record<string, unknown>,
    fieldErrors?: Record<string, string[]>
  ) {
    super(message, context);
    this.fieldErrors = fieldErrors;
  }

  getUserMessage(): string {
    if (this.fieldErrors && Object.keys(this.fieldErrors).length > 0) {
      const firstField = Object.keys(this.fieldErrors)[0];
      const firstError = this.fieldErrors[firstField][0];
      return `${firstField}: ${firstError}`;
    }
    return this.message;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fieldErrors: this.fieldErrors,
    };
  }
}

/**
 * Specific validation error types
 */

export class MissingFieldError extends ValidationError {
  override readonly code = 'MISSING_FIELD' as const;

  constructor(fieldName: string, context?: Record<string, unknown>) {
    super(`Missing required field: ${fieldName}`, {
      ...context,
      fieldName,
    });
  }
}

export class InvalidFormatError extends ValidationError {
  override readonly code = 'INVALID_FORMAT' as const;

  constructor(
    fieldName: string,
    expectedFormat: string,
    context?: Record<string, unknown>
  ) {
    super(`Invalid format for ${fieldName}. Expected: ${expectedFormat}`, {
      ...context,
      fieldName,
      expectedFormat,
    });
  }
}

export class OutOfRangeError extends ValidationError {
  override readonly code = 'OUT_OF_RANGE' as const;

  constructor(
    fieldName: string,
    min: number,
    max: number,
    actual: number,
    context?: Record<string, unknown>
  ) {
    super(
      `${fieldName} must be between ${min} and ${max}, got ${actual}`,
      {
        ...context,
        fieldName,
        min,
        max,
        actual,
      }
    );
  }
}

export class InvalidEnumValueError extends ValidationError {
  override readonly code = 'INVALID_ENUM_VALUE' as const;

  constructor(
    fieldName: string,
    allowedValues: string[],
    actual: string,
    context?: Record<string, unknown>
  ) {
    super(
      `${fieldName} must be one of: ${allowedValues.join(', ')}. Got: ${actual}`,
      {
        ...context,
        fieldName,
        allowedValues,
        actual,
      }
    );
  }
}