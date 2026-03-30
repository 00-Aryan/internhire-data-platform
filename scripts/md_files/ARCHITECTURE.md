# Profile Readiness Feature Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Profile Readiness Feature                      │
│                   src/core/profile-readiness/                     │
└─────────────────────────────────────────────────────────────────┘

                            ┌──────────────────┐
                            │  Public API      │
                            │ checkCapability()│
                            └────────┬─────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
        ┌──────────────────┐  ┌─────────┐  ┌─────────────────┐
        │   Role Router    │  │ Error   │  │  Graceful       │
        │ (Candidate vs    │  │Handler  │  │  Degradation    │
        │  Recruiter)      │  └─────────┘  │ (allow = true)  │
        └────────┬─────────┘               └─────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌─────────────────┐  ┌──────────────────┐
   │ Candidate       │  │ Recruiter        │
   │ Readiness       │  │ Readiness        │
   │ Engine          │  │ Engine           │
   │                 │  │                  │
   │ • apply_to_job  │  │ • post_job       │
   │ • start_        │  │ • view_          │
   │   assessment    │  │   assessments    │
   └─────────────────┘  └──────────────────┘
        │                     │
        ├─ checkBasic    ├─ checkBasic
        │ Profile()      │ Recruiter
        │ checkEducation │ Profile()
        │ Profile()      │
        │                │
        └────────┬───────┘
                 │
        ┌────────▼────────┐
        │ ReadinessResult │
        │ {               │
        │ allowed: bool   │
        │ reason?: str    │
        │ missing?: []    │
        │ }               │
        └─────────────────┘
```

## Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Integration Points                            │
└─────────────────────────────────────────────────────────────────┘

1. API ROUTE INTEGRATION
   ─────────────────────────────────────────────────────────────

   [POST /api/applications]
           │
           ▼
   [Fetch full candidate profile]
           │
           ▼
   [Build UserProfileData]
           │
           ▼
   [checkCapability('apply_to_job')]
           │
        ┌──┴──┐
        │     │
   YES  │     │  NO
        ▼     ▼
      CREATE  THROW
      APP.    ERROR
      
   Response: "PROFILE_INCOMPLETE: Full name, Date of birth, ..."


2. CLIENT-SIDE INTEGRATION
   ─────────────────────────────────────────────────────────────

   [Component Mount]
           │
           ▼
   [useReadiness hook]
           │
           ▼
   [checkCapability (async)]
           │
           ▼
   [Set allowed/missing state]
           │
        ┌──┴──┐
        │     │
   YES  │     │  NO
        ▼     ▼
      ENABLE  DISABLE
      BUTTON  BUTTON
              │
              ▼
         SHOW MODAL
      (use showCustomSuccess)
         with missing items
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   User Session / Router Handler                   │
└─────────────────────────────────────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
         ▼                                       ▼
   [Candidate Role]                        [Recruiter Role]
         │                                       │
         ▼                                       ▼
   Build UserProfileData              Build UserProfileData
   └─ userId                           └─ userId
   └─ role: 'CANDIDATE'                └─ role: 'RECRUITER'
   └─ candidateProfile {              └─ recruiterProfile {
      ├─ id                              ├─ id
      ├─ dob                             ├─ department
      ├─ city, state                     ├─ designation
      ├─ user {firstName, ...}           ├─ user {firstName, ...}
      ├─ tenthEducation                  └─ establishment
      ├─ twelfthEducation
      ├─ ugEducation []
      ├─ pgEducation []
      ├─ experience []
      ├─ skills []
      └─ subscription fields
      }
         │
         ▼
   checkCapability({user, capability})
         │
         ├─ CANDIDATE path                RECRUITER path
         │  checkCandidateReadiness()      checkRecruiterReadiness()
         │  │                              │
         │  ├─ apply_to_job?               ├─ post_job?
         │  │  checkBasicProfile()         │  checkBasicRecruiter()
         │  │                              │
         │  └─ start_assessment?           └─ view_assessments?
         │     checkBasicProfile()            checkBasicRecruiter()
         │     + checkEducationProfile()
         │
         ▼
   ReadinessResult
   │
   ├─ allowed: true/false
   ├─ reason: 'PROFILE_INCOMPLETE' | ...
   └─ missing: ['Full name', 'City and state', ...]
```

## Component Tree

```
src/core/profile-readiness/
│
├── index.ts
│   └─ exports: checkCapability, useReadiness, types
│
├── types.ts
│   ├─ Capability union
│   ├─ ReadinessResult interface
│   ├─ UserProfileData interface
│   └─ BlockingReason enum
│
├── readiness.service.ts
│   └─ checkCapability() ◄─── PUBLIC API
│       ├─ validates user
│       ├─ routes by role
│       └─ handles errors gracefully
│
├── candidate.readiness.ts
│   ├─ checkCandidateReadiness()
│   ├─ checkApplyCapability()
│   ├─ checkAssessmentCapability()
│   ├─ checkBasicProfile()
│   └─ checkEducationProfile()
│
├── recruiter.readiness.ts
│   ├─ checkRecruiterReadiness()
│   ├─ checkPostJobCapability()
│   ├─ checkViewAssessmentsCapability()
│   └─ checkBasicRecruiterProfile()
│
├── useReadiness.ts
│   └─ useReadiness() ◄─── CLIENT HOOK
│       ├─ accepts {user, capability, enabled}
│       └─ returns {allowed, missing, loading}
│
└── examples/
    ├─ ApplyButton.example.tsx
    │  └─ Shows apply gating pattern
    ├─ StartAssessmentButton.example.tsx
    │  └─ Shows assessment gating pattern
    └─ PaymentButton.example.tsx
       └─ Shows recruiter payment gating pattern
```

## Error Handling Flow

```
checkCapability()
    │
    ├─ No user?
    │  └─ return { allowed: false, missing: [...] }
    │
    ├─ Invalid role?
    │  └─ return { allowed: false, missing: [...] }
    │
    ├─ Check engine throws?
    │  └─ catch
    │     └─ log error
    │        └─ return { allowed: true } ◄─ GRACEFUL DEGRADATION
    │
    └─ Success
       └─ return { allowed, reason, missing }
```

## Capability Matrix

```
CANDIDATE
┌─────────────────┬──────────────┬─────────────────┐
│ Capability      │ Required     │ Additional      │
├─────────────────┼──────────────┼─────────────────┤
│ apply_to_job    │ Basic        │ None            │
├─────────────────┼──────────────┼─────────────────┤
│ start_assessment│ Basic        │ Education       │
└─────────────────┴──────────────┴─────────────────┘

Basic = {firstName, lastName, dob, city, state}
Education = {10th OR 12th OR UG OR PG}


RECRUITER
┌──────────────────┬────────────────┬─────────────────┐
│ Capability       │ Required       │ Additional      │
├──────────────────┼────────────────┼─────────────────┤
│ post_job         │ Full Profile   │ None            │
├──────────────────┼────────────────┼─────────────────┤
│ view_assessments │ Full Profile   │ None            │
└──────────────────┴────────────────┴─────────────────┘

Full Profile = {firstName, lastName, company, designation}
```

## Integration Checklist for New Capabilities

To add `new_capability`:

```
1. types.ts
   └─ Add 'new_capability' to Capability union

2. candidate.readiness.ts (if candidate action)
   └─ Add checkNewCapabilityCapability() function

3. recruiter.readiness.ts (if recruiter action)
   └─ Add checkNewCapabilityCapability() function

4. In your component/route:
   └─ const readiness = await checkCapability({
        user,
        capability: 'new_capability'
      });
      if (!readiness.allowed) { /* handle */ }

5. Done! Feature is gated.
```
