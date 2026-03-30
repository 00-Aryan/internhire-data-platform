'use server';

import { getSessionUser } from '@/core/auth/authUtils';
import { ReferralRepository } from '@/core/referral/referralRepository';
import { ReferralService } from '@/core/referral/referralService';
import { revalidatePath } from 'next/cache';

export async function removeReferrerAction() {
  const user = await getSessionUser();

  if (!user || !user.candidateProfile) {
    return { ok: false, reason: 'UNAUTHORIZED' };
  }

  const referralService = new ReferralService(new ReferralRepository());

  try {
    await referralService.removeReferrer(user.candidateProfile.id);
    revalidatePath('/candidate/subscription');
    return { ok: true };
  } catch (error: any) {
    return {
      ok: false,
      reason: error.message === 'Referral is already locked and cannot be changed' ? 'LOCKED' : 'FAILED',
    };
  }
}