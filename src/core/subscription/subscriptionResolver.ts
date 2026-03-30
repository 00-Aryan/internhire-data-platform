// src/core/subscription/subscriptionResolver.ts

import type { SubscriptionDTO } from './subscriptionService';

export function hasActiveCandidateSubscription(
  subscription: SubscriptionDTO | null,
  email: string
): boolean {
  if (email.endsWith('@smail.iitm.ac.in')) return true;
  return !!subscription && subscription.status === 'ACTIVE';
}
