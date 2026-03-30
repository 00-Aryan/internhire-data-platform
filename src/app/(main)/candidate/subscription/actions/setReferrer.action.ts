'use server';

import { getSessionUser } from '@/core/auth/authUtils';
import { ReferralService } from '@/core/referral/referralService';
import { ReferralRepository } from '@/core/referral/referralRepository';

export async function setReferrerAction(
  referrerCode: string
): Promise<
  | { ok: true }
  | {
      ok: false;
      reason:
        | 'INVALID_CODE'
        | 'SELF_REFERRAL'
        | 'LOCKED'
        | 'CIRCULAR'
        | 'DEPTH_EXCEEDED'
        | 'FAILED';
      message?: string;
    }
> {
  try {
    const user = await getSessionUser();

    if (!user || !user.candidateProfile) {
      return { ok: false, reason: 'FAILED', message: 'User not authenticated' };
    }

    const referralService = new ReferralService(
      new ReferralRepository()
    );

    await referralService.setReferrer(
      user.candidateProfile.id,
      referrerCode
    );

    return { ok: true };
  } catch (err: any) {
    const msg = err.message ?? 'Unknown error';
    const lowerMsg = msg.toLowerCase();

    if (lowerMsg.includes('invalid')) return { ok: false, reason: 'INVALID_CODE', message: msg };
    if (lowerMsg.includes('self')) return { ok: false, reason: 'SELF_REFERRAL', message: msg };
    if (lowerMsg.includes('locked')) return { ok: false, reason: 'LOCKED', message: msg };
    if (lowerMsg.includes('circular')) return { ok: false, reason: 'CIRCULAR', message: msg };
    if (lowerMsg.includes('depth')) return { ok: false, reason: 'DEPTH_EXCEEDED', message: msg };

    return { ok: false, reason: 'FAILED', message: msg };
  }
}