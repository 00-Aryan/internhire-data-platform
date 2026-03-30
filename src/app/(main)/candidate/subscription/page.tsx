// src/app/(main)/candidate/subscription/page.tsx

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/core/auth/authUtils';
import CandidateSubscriptionView from '@/features/subscription/CandidateSubscriptionView';
import { buildCandidateSubscriptionViewModel } from './adapters/CandidateSubscriptionServerAdapter';

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ coupon?: string }>;
}) {
  // 1️⃣ Resolve async inputs first
  const resolvedSearchParams = await searchParams;

  // 2️⃣ Resolve auth next
  const user = await getSessionUser();

  if (!user) {
    redirect('/');
  }

  if (user.activeRole !== 'CANDIDATE' || !user.candidateProfile) {
    redirect('/');
  }

  // 3️⃣ Build view model exactly once
  const viewModel = await buildCandidateSubscriptionViewModel({
    candidateId: user.candidateProfile.id,
    email: user.email,
    appliedCouponCode: resolvedSearchParams.coupon ?? null,
  });

  // 4️⃣ Render
 return (
  <CandidateSubscriptionView
    candidateId={user.candidateProfile.id}
    candidateEmail={user.email}
    {...viewModel}
  />
);

}
