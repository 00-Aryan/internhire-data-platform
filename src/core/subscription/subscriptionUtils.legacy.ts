import { SUBSCRIPTION_BASE_PRICE } from './subscriptionPricing';

/**
 * ⚠️ LEGACY SUBSCRIPTION LOGIC
 *
 * This file exists ONLY for backward compatibility with deployed flows.
 *
 * ❌ Do NOT add new logic here
 * ❌ Do NOT fix edge cases here
 * ❌ Do NOT reference this file in new features
 *
 * Source of truth going forward:
 * - Subscription table
 * - SubscriptionService
 ** ❌ LEGACY — READ FORBIDDEN
 *
 * These helpers must NOT be used for authorization or UI gating.
 * SubscriptionReadService is the ONLY allowed read path.
 *
 * Removal planned in Phase 4.3
 * This file will be deprecated in Phase 4.
 */


const FREE_ACCESS_EMAILS = [
  'ak846788@gmail.com',
  '22f2000697@ds.study.iitm.ac.in',
];

export const SUBSCRIPTION_PLANS = {
  candidate: {
    price: SUBSCRIPTION_BASE_PRICE,
    durationDays: 365,
    freeEmailDomain: '@smail.iitm.ac.in',
  },
  recruiter: {
    price: 100,
    durationDays: 30,
  },
} as const;

/* ---------- helpers ---------- */

export function isFreeCandidateEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (FREE_ACCESS_EMAILS.map(e => e.toLowerCase()).includes(lower)) {
    return true;
  }
  return lower.endsWith(SUBSCRIPTION_PLANS.candidate.freeEmailDomain);
}

export function getExpiryFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

/* ---------- candidate ---------- */

export function hasCandidateActiveSubscription(
  expiry: Date | null,
  email?: string
): boolean {
  if (email && isFreeCandidateEmail(email)) return true;
  if (!expiry) return false;
  return new Date() < new Date(expiry);
}

/* ---------- recruiter ---------- */

/**
 * Normalized signature to match candidate utility.
 * Email is ignored but accepted for API consistency.
 */
export function hasRecruiterActiveSubscription(
  expiry: Date | null,
  _email?: string
): boolean {
  if (!expiry) return false;
  return new Date() < new Date(expiry);
}

/* ---------- backward compatibility aliases ---------- */

/**
 * Alias for hasCandidateActiveSubscription for assessments
 * Maintains backward compatibility with old API
 */
export function canCandidateTakeAssessments(
  expiry: Date | null,
  email: string
): boolean {
  return hasCandidateActiveSubscription(expiry, email);
}

/**
 * Alias for isFreeCandidateEmail
 * Maintains backward compatibility with old API
 */
export function isFreeEmailCandidate(email: string): boolean {
  return isFreeCandidateEmail(email);
}

/**
 * Check if candidate should get free subscription
 * Returns true for free candidates (IITM students)
 */
export async function shouldGetFreeCandidateSubscription(
  email: string
): Promise<boolean> {
  return isFreeCandidateEmail(email);
}

/**
 * Check if recruiter should get free subscription
 * All recruiters get free subscription
 */
export async function shouldGetFreeRecruiterSubscription(): Promise<boolean> {
  return true;
}

/**
 * Get subscription expiry date for candidates
 * Returns 1 year from now for free users/IITM, null otherwise
 */
export function getCandidateSubscriptionExpiry(
  isFree: boolean,
  isIITM: boolean
): Date | null {
  if (isFree || isIITM) {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    return expiry;
  }
  return null;
}
