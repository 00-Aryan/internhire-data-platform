// src/core/errors/AuthorizationError.ts
// Authentication and authorization failures

import { DomainError } from './DomainError';

/**
 * Authentication error - user not authenticated
 * 
 * Use when:
 * - No session/token provided
 * - Session/token expired
 * - Session/token invalid
 */
export class AuthenticationError extends DomainError {
  readonly code: string = 'AUTHENTICATION_ERROR';
  readonly statusCode = 401; // Unauthorized

  constructor(message: string = 'Authentication required', context?: Record<string, unknown>) {
    super(message, context);
  }

  getUserMessage(): string {
    return 'Please sign in to continue';
  }
}

/**
 * Authorization error - user authenticated but lacks permission
 * 
 * Use when:
 * - User tries to access resource they don't own
 * - User lacks required role/capability
 * - Action violates business rules for this user
 */
export class AuthorizationError extends DomainError {
  readonly code: string = 'AUTHORIZATION_ERROR';
  readonly statusCode = 403; // Forbidden

  readonly requiredCapability?: string;

  constructor(
    message: string = 'You do not have permission to perform this action',
    context?: Record<string, unknown>,
    requiredCapability?: string
  ) {
    super(message, context);
    this.requiredCapability = requiredCapability;
  }

  getUserMessage(): string {
    if (this.requiredCapability) {
      return `This action requires the '${this.requiredCapability}' permission`;
    }
    return this.message;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      requiredCapability: this.requiredCapability,
    };
  }
}

/**
 * Specific authorization error types
 */

export class InsufficientPermissionsError extends AuthorizationError {
  override readonly code = 'INSUFFICIENT_PERMISSIONS' as const;

  readonly resource: string;

  constructor(action: string, resource: string, context?: Record<string, unknown>) {
    super(`Insufficient permissions to ${action} ${resource}`, {
      ...context,
      action,
      resource,
    });
    this.resource = resource;
  }
}

export class ResourceOwnershipError extends AuthorizationError {
  override readonly code = 'RESOURCE_OWNERSHIP_ERROR' as const;

  constructor(resourceType: string, resourceId: string, context?: Record<string, unknown>) {
    super(`You do not have access to this ${resourceType}`, {
      ...context,
      resourceType,
      resourceId,
    });
  }

  getUserMessage(): string {
    return `You do not have access to this resource`;
  }
}

export class RoleRequiredError extends AuthorizationError {
  override readonly code = 'ROLE_REQUIRED' as const;

  readonly requiredRole: string;

  constructor(requiredRole: string, context?: Record<string, unknown>) {
    super(`This action requires the '${requiredRole}' role`, {
      ...context,
      requiredRole,
    });
    this.requiredRole = requiredRole;
  }
}

export class AccountStatusError extends AuthorizationError {
  override readonly code = 'ACCOUNT_STATUS_ERROR' as const;

  readonly accountStatus: string;

  constructor(status: string, reason: string, context?: Record<string, unknown>) {
    super(`Account is ${status}: ${reason}`, {
      ...context,
      status,
      reason,
    });
    this.accountStatus = status;
  }

  getUserMessage(): string {
    return `Your account is currently ${this.accountStatus}. Please contact support.`;
  }
}