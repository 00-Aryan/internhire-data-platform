'use server';

import { SubscriptionService, PricingSource } from '@/core/subscription/subscriptionService';
import { SubscriptionRepository } from '@/core/subscription/subscriptionRepository';
import { ReferralService } from '@/core/referral/referralService';
import { ReferralRepository } from '@/core/referral/referralRepository';
import { WalletService } from '@/core/wallet/walletService';
import { WalletRepository } from '@/core/wallet/walletRepository';

export async function createSubscriptionAction(input: {
  candidateId: string;
  candidateEmail: string;
  referralCode?: string | null;
  couponCode?: string | null;
}): Promise<
  | {
      ok: true;
      subscriptionId: string;
      pricePaid: number;
      pricingSource: PricingSource;
      appliedCouponCode?: string;
    }
  | { ok: false; reason: 'ALREADY_ACTIVE' | 'FAILED' }
> {
  try {
    // Explicit DI (no globals)
    const subscriptionRepo = new SubscriptionRepository();
    const referralService = new ReferralService(new ReferralRepository());
    const walletService = new WalletService(new WalletRepository());

    const subscriptionService = new SubscriptionService(
      subscriptionRepo,
      referralService,
      walletService
    );

    // 🔒 IMPORTANT:
    // This creates a PENDING subscription ONLY
    // Activation happens AFTER Razorpay verification
    const subscription =
      await subscriptionService.createPendingSubscription({
        candidateId: input.candidateId,
        candidateEmail: input.candidateEmail,
        referralCode: input.referralCode ?? undefined,
        couponCode: input.couponCode ?? undefined,
      });

    return {
      ok: true,
      subscriptionId: subscription.id,
      pricePaid: subscription.pricePaid,
      pricingSource: subscription.pricingSource,
      appliedCouponCode: subscription.appliedCouponCode,
    };
  } catch (err: any) {
    if (err.message?.includes('active subscription')) {
      return { ok: false, reason: 'ALREADY_ACTIVE' };
    }

    console.error('createSubscriptionAction failed', err);
    return { ok: false, reason: 'FAILED' };
  }
}
