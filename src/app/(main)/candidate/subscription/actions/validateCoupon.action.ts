'use server';

import { SubscriptionService } from '@/core/subscription/subscriptionService';
import { SubscriptionRepository } from '@/core/subscription/subscriptionRepository';
import { ReferralService } from '@/core/referral/referralService';
import { ReferralRepository } from '@/core/referral/referralRepository';
import { WalletService } from '@/core/wallet/walletService';
import { WalletRepository } from '@/core/wallet/walletRepository';

export async function validateCouponAction(
  candidateId: string,
  candidateEmail: string,
  code: string
): Promise<
  | { ok: true; finalPrice: number; code: string }
  | { ok: false; message: string }
> {
  try {
    const subscriptionService = new SubscriptionService(
      new SubscriptionRepository(),
      new ReferralService(new ReferralRepository()),
      new WalletService(new WalletRepository())
    );

    const result = await subscriptionService.validateCoupon(
      candidateId,
      candidateEmail,
      code
    );

    if (!result.isValid) {
      return { ok: false, message: 'Invalid or expired coupon code' };
    }

    return {
      ok: true,
      finalPrice: result.finalPrice,
      code: result.appliedCouponCode!,
    };
  } catch (error) {
    console.error('validateCouponAction failed', error);
    return { ok: false, message: 'Failed to validate coupon' };
  }
}