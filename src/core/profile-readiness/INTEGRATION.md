/**
 * INTEGRATION DOCUMENTATION: Profile Readiness Feature
 * 
 * ## Overview
 * The profile readiness feature soft-gates actions (apply, assess, post job, pay)
 * based on profile completeness. It does NOT block routes or create new modals.
 * 
 * ## Core API
 * 
 * ### checkCapability(params: CheckCapabilityParams): Promise<ReadinessResult>
 * 
 * Location: src/core/profile-readiness/readiness.service.ts
 * 
 * Usage (Server-side):
 * ```ts
 * import { checkCapability } from '@/core/profile-readiness/readiness.service';
 * 
 * const readiness = await checkCapability({
 *   user: profileData,  // UserProfileData type
 *   capability: 'apply_to_job' | 'start_assessment' | 'post_job' | 'view_assessments'
 * });
 * 
 * if (!readiness.allowed) {
 *   console.log(readiness.missing); // ['Full name', 'Education details']
 * }
 * ```
 * 
 * ## Hook Usage (Client-side)
 * 
 * Location: src/core/profile-readiness/useReadiness.ts
 * 
 * ```tsx
 * import { useReadiness } from '@/core/profile-readiness/useReadiness';
 * 
 * function MyComponent({ user }) {
 *   const { allowed, missing, loading } = useReadiness({
 *     user,
 *     capability: 'apply_to_job',
 *   });
 * 
 *   if (!allowed) {
 *     return <p>Please complete: {missing?.join(', ')}</p>;
 *   }
 * 
 *   return <button>Apply</button>;
 * }
 * ```
 * 
 * ## Capabilities
 * 
 * - `apply_to_job`: Candidate - requires basic profile (name, DOB, location)
 * - `start_assessment`: Candidate - requires basic profile + education
 * - `post_job`: Recruiter - requires full name, company, designation
 * - `view_assessments`: Recruiter - requires full name, company, designation
 * 
 * ## Readiness Result
 * 
 * ```ts
 * interface ReadinessResult {
 *   allowed: boolean;
 *   reason?: 'PROFILE_INCOMPLETE' | 'SUBSCRIPTION_REQUIRED';
 *   missing?: string[];  // human-readable, non-technical
 *   metadata?: Record<string, any>;
 * }
 * ```
 * 
 * ## Graceful Degradation
 * 
 * If the profile-readiness feature folder is deleted or errors occur,
 * checkCapability() returns { allowed: true } automatically.
 * This ensures the app continues functioning without the feature.
 * 
 * ## Integration Points
 * 
 * 1. **Apply Button**: Check 'apply_to_job' capability before fetch
 * 2. **Assessment Start**: Check 'start_assessment' before navigation
 * 3. **Payment Button**: Check 'post_job' before payment initialization
 * 4. **API Routes**: Server-side check in POST handlers (applications/route.ts example)
 * 
 * See examples/ folder for complete component implementations.
 * 
 * ## Rules
 * 
 * - Never hardcode profile field checks outside profile-readiness files
 * - Reuse existing SuccessModal, do not create new modals
 * - Show missing items as user-friendly strings
 * - Do not block route navigation (action-based gating only)
 * - Do not refactor existing business logic
 */
