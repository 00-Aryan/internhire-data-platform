export type ApplicationErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_INPUT'
  | 'JOB_NOT_FOUND'
  | 'ALREADY_APPLIED'
  | 'INTERNAL_ERROR'
  | 'SUBSCRIPTION_REQUIRED'
  | 'JOB_NOT_FOUND'
  | 'ALREADY_APPLIED';

// Typed domain error
export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode;

  constructor(code: ApplicationErrorCode) {
    super(code);
    this.code = code;
    this.name = 'ApplicationError';
  }
}