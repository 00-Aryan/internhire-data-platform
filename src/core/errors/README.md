# Domain Error System

**Typed, safe, production-grade error handling**

## 🎯 What Problem Does This Solve?

### Before Refactor
```typescript
// ❌ Problems:
// - Errors are strings
// - Sanitized too early
// - Can't distinguish infrastructure vs domain failures
// - Hard to map to HTTP status codes
// - No structured logging

if (!user) {
  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}

throw new Error('Something went wrong'); // What status code?
```

### After Refactor
```typescript
// ✅ Solutions:
// - Typed domain errors
// - Automatic HTTP mapping
// - Safe user messages
// - Structured logging
// - Clear failure categories

import { NotFoundError, withErrorHandling } from '@/core/errors';

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await findUser(id);
    if (!user) {
      throw new NotFoundError('User', id);
      // Automatically becomes: 404 + safe message + logged
    }
    return user;
  });
}
```

---

## 📂 Error Hierarchy

```
DomainError (Base)
├── ValidationError
│   ├── MissingFieldError
│   ├── InvalidFormatError
│   ├── OutOfRangeError
│   └── InvalidEnumValueError
├── AuthenticationError
├── AuthorizationError
│   ├── InsufficientPermissionsError
│   ├── ResourceOwnershipError
│   ├── RoleRequiredError
│   └── AccountStatusError
├── BusinessLogicError
│   ├── NotFoundError
│   ├── AlreadyExistsError
│   ├── InvalidStateTransitionError
│   ├── InvalidOperationError
│   ├── QuotaExceededError
│   └── DependencyError
└── ScoringError
    ├── InsufficientScoringDataError
    ├── InvalidScoringConfigError
    ├── ScoreComputationError
    ├── InvalidWeightError
    ├── NoScoresAvailableError
    └── ScoreAlreadyExistsError

InfrastructureError (Separate hierarchy)
├── DatabaseError
├── ExternalServiceError
├── NetworkError
├── RateLimitError
└── FileSystemError
```

---

## 🚀 Usage Examples

### Example 1: API Route Error Handling

```typescript
// src/app/api/candidates/[id]/route.ts
import { NextRequest } from 'next/server';
import { withErrorHandling, NotFoundError, AuthorizationError } from '@/core/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(req, async () => {
    // 1. Validate authentication
    const session = await getSession(req);
    if (!session) {
      throw new AuthenticationError(); // → 401
    }

    // 2. Fetch resource
    const candidate = await prisma.candidate.findUnique({
      where: { id: params.id },
    });

    if (!candidate) {
      throw new NotFoundError('Candidate', params.id); // → 404
    }

    // 3. Check authorization
    if (candidate.userId !== session.userId) {
      throw new AuthorizationError(
        'You do not have access to this candidate',
        { candidateId: params.id, userId: session.userId }
      ); // → 403
    }

    // 4. Return data
    return candidate;
  });
}

// Response on error:
// {
//   "error": {
//     "code": "NOT_FOUND",
//     "message": "The requested Candidate could not be found",
//     "timestamp": "2025-01-06T10:30:00.000Z"
//   }
// }
```

### Example 2: Service Layer with Validation

```typescript
// src/features/jobs/services/publishJob.service.ts
import {
  ValidationError,
  InvalidStateTransitionError,
  QuotaExceededError,
  assertExists,
  validate,
} from '@/core/errors';

export async function publishJob(jobId: string, recruiterId: string) {
  // 1. Validate inputs
  validate(!!jobId, new ValidationError('Job ID is required'));
  validate(!!recruiterId, new ValidationError('Recruiter ID is required'));

  // 2. Fetch and assert existence
  const job = assertExists(
    await prisma.job.findUnique({ where: { id: jobId } }),
    new NotFoundError('Job', jobId)
  );

  // 3. Check authorization
  if (job.recruiterId !== recruiterId) {
    throw new AuthorizationError('You do not own this job');
  }

  // 4. Check state transition
  if (job.status === 'PUBLISHED') {
    throw new InvalidStateTransitionError('Job', 'PUBLISHED', 'PUBLISHED');
  }

  // 5. Check quota
  const publishedCount = await prisma.job.count({
    where: { recruiterId, status: 'PUBLISHED' },
  });

  if (publishedCount >= 10) {
    throw new QuotaExceededError('active jobs', 10, publishedCount);
  }

  // 6. Perform action
  return await prisma.job.update({
    where: { id: jobId },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  });
}
```

### Example 3: Scoring with Domain Errors

```typescript
// src/core/scoring/subdomain.ts (UPDATED)
import { InsufficientScoringDataError, ScoreComputationError } from '@/core/errors';

export function processSubdomain(context: SubdomainContext) {
  const { subdomainId, rawScores } = context;

  // Throw typed error instead of returning error object
  if (rawScores.length === 0) {
    throw new InsufficientScoringDataError(
      'subdomain',
      [subdomainId],
      [],
      { subdomainId }
    );
  }

  const stats = computeStatistics(rawScores.map(s => s.value));
  if (!stats) {
    throw new ScoreComputationError(
      'subdomain',
      'Failed to compute statistics',
      { subdomainId, scoreCount: rawScores.length }
    );
  }

  return rawScores.map(raw =>
    computeSubdomainScore(raw.candidateId, raw.value, stats)
  );
}
```

### Example 4: UI Error Handling

```typescript
// src/app/candidates/[id]/page.tsx
import { toUiError } from '@/core/errors';

export default async function CandidatePage({ params }: { params: { id: string } }) {
  try {
    const candidate = await fetchCandidate(params.id);
    return <CandidateView candidate={candidate} />;
  } catch (error) {
    const uiError = toUiError(error);
    
    return (
      <ErrorDisplay
        title={uiError.title}
        message={uiError.message}
        action={uiError.action}
        canRetry={uiError.canRetry}
      />
    );
  }
}

// Example UI Error object:
// {
//   title: "Not Found",
//   message: "The requested Candidate could not be found",
//   action: "Check the URL or try searching",
//   canRetry: false
// }
```

### Example 5: Database Error Wrapping

```typescript
// src/infra/repositories/CandidateRepo.ts
import { DatabaseError, NotFoundError } from '@/core/errors';
import { safeAsync } from '@/core/errors';

export class CandidateRepository {
  async findById(id: string) {
    return safeAsync(
      async () => {
        const candidate = await prisma.candidate.findUnique({ where: { id } });
        if (!candidate) {
          throw new NotFoundError('Candidate', id);
        }
        return candidate;
      },
      (error) => new DatabaseError('findById', error as Error, { candidateId: id })
    );
  }

  async create(data: CreateCandidateInput) {
    return safeAsync(
      async () => {
        return await prisma.candidate.create({ data });
      },
      (error) => {
        // Check for unique constraint violation
        if ((error as any).code === 'P2002') {
          throw new AlreadyExistsError('Candidate', 'email');
        }
        throw new DatabaseError('create', error as Error, { data });
      }
    );
  }
}
```

### Example 6: Retry with Backoff

```typescript
// src/infra/external/emailService.ts
import { retryWithBackoff, ExternalServiceError, isRetryableError } from '@/core/errors';

export async function sendEmail(to: string, subject: string, body: string) {
  return retryWithBackoff(
    async () => {
      const response = await fetch('https://api.emailprovider.com/send', {
        method: 'POST',
        body: JSON.stringify({ to, subject, body }),
      });

      if (!response.ok) {
        throw new ExternalServiceError(
          'EmailProvider',
          `HTTP ${response.status}`,
          { to, subject }
        );
      }

      return response.json();
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      shouldRetry: isRetryableError,
    }
  );
}
```

### Example 7: Custom Error Helpers

```typescript
// src/core/errors/helpers.ts (your custom additions)
import { notFound, unauthorized, invalid } from '@/core/errors';

// Use the built-in helpers
export function ensureCandidate(id: string) {
  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) throw notFound.candidate(id);
  return candidate;
}

export function ensureJobOwner(job: Job, userId: string) {
  if (job.recruiterId !== userId) {
    throw unauthorized.notResourceOwner('Job', job.id);
  }
}

export function validateEmail(email: string) {
  if (!email.includes('@')) {
    throw invalid.invalidFormat('email', 'user@example.com');
  }
}
```

---

## 🧪 Testing with Errors

```typescript
// __tests__/services/publishJob.test.ts
import { publishJob } from '@/features/jobs/services/publishJob.service';
import { NotFoundError, QuotaExceededError } from '@/core/errors';

describe('publishJob', () => {
  it('throws NotFoundError for non-existent job', async () => {
    await expect(publishJob('invalid-id', 'recruiter-id'))
      .rejects.toThrow(NotFoundError);
  });

  it('throws QuotaExceededError when limit reached', async () => {
    // Setup: Create 10 published jobs
    
    await expect(publishJob('new-job-id', 'recruiter-id'))
      .rejects.toThrow(QuotaExceededError);
  });

  it('includes context in errors', async () => {
    try {
      await publishJob('invalid-id', 'recruiter-id');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      expect((error as NotFoundError).resourceId).toBe('invalid-id');
      expect((error as NotFoundError).statusCode).toBe(404);
    }
  });
});
```

---

## 📊 Error Flow Diagram

```
User Action → API Route
                ↓
          withErrorHandling()
                ↓
          Service Layer → throws DomainError
                ↓
          API catches error
                ↓
          toHttpError() maps to HTTP response
          toLogError() logs structured data
                ↓
          User receives safe message
          Logs contain full context
```

---

## 🔧 Migration Guide

### Step 1: Update API Routes

**Before:**
```typescript
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(id);
    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

**After:**
```typescript
import { withErrorHandling, NotFoundError } from '@/core/errors';

export async function GET(req: NextRequest) {
  return withErrorHandling(req, async () => {
    const user = await getUser(id);
    if (!user) throw new NotFoundError('User', id);
    return user;
  });
}
```

### Step 2: Update Service Layer

**Before:**
```typescript
export async function updateProfile(userId: string, data: any) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  
  if (!data.email) throw new Error('Email required');
  
  return await prisma.user.update({ where: { id: userId }, data });
}
```

**After:**
```typescript
import { NotFoundError, MissingFieldError, assertExists } from '@/core/errors';

export async function updateProfile(userId: string, data: ProfileInput) {
  const user = assertExists(
    await prisma.user.findUnique({ where: { id: userId } }),
    new NotFoundError('User', userId)
  );
  
  if (!data.email) throw new MissingFieldError('email');
  
  return await prisma.user.update({ where: { id: userId }, data });
}
```

### Step 3: Update Scoring Pipeline

**Before:**
```typescript
if (rawScores.length === 0) {
  return {
    success: false,
    error: {
      type: 'INSUFFICIENT_DATA',
      message: `No scores for ${subdomainId}`,
    },
  };
}
```

**After:**
```typescript
import { InsufficientScoringDataError } from '@/core/errors';

if (rawScores.length === 0) {
  throw new InsufficientScoringDataError(
    candidateId,
    [subdomainId],
    [],
    { subdomainId }
  );
}
```

---

## 🎯 Interview Impact

### Before
> "We handle errors with try-catch and return appropriate status codes..."

### After
> "We have a typed domain error system. Errors are distinguished at the type level—domain errors represent business rule violations, infrastructure errors represent external failures. Each error maps automatically to the correct HTTP status, safe user message, and structured log. Want me to show you how we handle authorization failures?"

---

## 📊 ROI Summary

| Metric | Before | After | Impact |
|--------|--------|-------|--------|
| **Error type safety** | ❌ Strings | ✅ Types | 🟢 Compile-time checks |
| **HTTP mapping** | ❌ Manual | ✅ Automatic | 🟢 Consistent responses |
| **User messages** | ❌ Leaked internals | ✅ Safe messages | 🟢 Security + UX |
| **Logging** | ❌ Inconsistent | ✅ Structured | 🟢 Debuggability |
| **Testability** | 🟡 Medium | 🟢 High | 🟢 Assert error types |
| **Code clarity** | 🟡 Mixed concerns | 🟢 Clear boundaries | 🟢 Maintainability |

---

## 🔒 Security Benefits

1. **No information leakage**: User messages are safe by default
2. **Structured logging**: Full context for debugging without exposing to users
3. **Type safety**: Can't accidentally return wrong status code
4. **Audit trail**: Every error includes timestamp and context

---

## 🎓 Design Principles

### 1. **Type Safety**
- Every error is a distinct type
- Compiler catches missing error handling

### 2. **Separation of Concerns**
- Core throws domain errors
- Infrastructure maps to HTTP/UI
- Never mix them

### 3. **Safe by Default**
- User messages are safe
- Internal details only in logs
- No sensitive data exposure

### 4. **Structured & Searchable**
- All errors have codes
- All errors have context
- Easy to query in logs

### 5. **Framework Agnostic**
- Core errors have no Next.js dependency
- Mappers handle framework specifics
- Reusable across platforms

---

## 📝 Summary

This error system transforms InternHire from:
- **"Error handling with try-catch"**

To:
- **"Production-grade error architecture with type safety and security"**

**Interviewer takeaway:**
> "This candidate understands production systems and security."