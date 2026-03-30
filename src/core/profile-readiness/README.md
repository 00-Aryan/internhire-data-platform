# Profile Readiness Quick Reference

## Import in Your Code

```typescript
// Server-side
import { checkCapability } from '@/core/profile-readiness';
import type { UserProfileData } from '@/core/profile-readiness';

// Client-side
import { useReadiness } from '@/core/profile-readiness';
```

## Server Usage (API Routes)

```typescript
// In POST handler
const readiness = await checkCapability({
  user: profileData,
  capability: 'apply_to_job'
});

if (!readiness.allowed) {
  return NextResponse.json(
    { error: `${readiness.reason}: ${readiness.missing?.join(', ')}` },
    { status: 400 }
  );
}
```

## Client Usage (React Components)

```typescript
'use client';

import { useReadiness } from '@/core/profile-readiness';
import { useNotification } from '@/shared/notifications/useNotification';

function MyButton({ user, jobId }) {
  const { allowed, missing } = useReadiness({
    user,
    capability: 'apply_to_job'
  });
  
  const { showCustomSuccess } = useNotification();

  const handleClick = () => {
    if (!allowed) {
      showCustomSuccess(
        'Profile Incomplete',
        `Please add: ${missing?.join(', ')}`
      );
      return;
    }
    // Do your action
  };

  return (
    <button disabled={!allowed} onClick={handleClick}>
      Apply
    </button>
  );
}
```

## Available Capabilities

- `apply_to_job` - Candidate: basic profile required
- `start_assessment` - Candidate: basic + education required
- `post_job` - Recruiter: full profile required
- `view_assessments` - Recruiter: full profile required

## Building UserProfileData

From session or route handler:

```typescript
const profileData: UserProfileData = {
  userId: user.id,
  role: 'CANDIDATE',
  candidateProfile: {
    id: candidate.id,
    dob: candidate.dob,
    city: candidate.city,
    state: candidate.state,
    user: {
      firstName: candidate.user.firstName,
      lastName: candidate.user.lastName,
      email: candidate.user.email,
    },
    tenthEducation: candidate.tenthEducation,
    twelfthEducation: candidate.twelfthEducation,
    ugEducation: candidate.ugEducation,
    pgEducation: candidate.pgEducation,
    experience: candidate.experience,
    skills: candidate.skills,
    internshipsSubscriptionExpiry: candidate.internshipsSubscriptionExpiry,
    assessmentsSubscriptionExpiry: candidate.assessmentsSubscriptionExpiry,
  },
};
```

## ReadinessResult Shape

```typescript
{
  allowed: boolean;
  reason?: 'PROFILE_INCOMPLETE' | 'SUBSCRIPTION_REQUIRED';
  missing?: ['Full name', 'Date of birth', ...];
  metadata?: {...};
}
```

## Error Handling

Errors are caught and logged. On error, the feature returns `{ allowed: true }` to ensure the app doesn't break.

Never hardcode error handling - always use the return value.

## Examples

See `src/core/profile-readiness/examples/` for:
- ApplyButton.example.tsx
- StartAssessmentButton.example.tsx
- PaymentButton.example.tsx

## Full Documentation

See `src/core/profile-readiness/INTEGRATION.md` for complete integration guide.
