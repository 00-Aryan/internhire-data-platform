import { SubscriptionReadService } from '@/core/subscription/subscriptionReadService';
import { ReferralService } from '@/core/referral/referralService';
import { WalletService } from '@/core/wallet/walletService';
import { WalletRepository } from '@/core/wallet/walletRepository';
import { validateCouponAction } from '../actions/validateCoupon.action';
import { ReferralRepository } from '@/core/referral/referralRepository';
import { SUBSCRIPTION_BASE_PRICE, SUBSCRIPTION_REFERRAL_PRICE } from '@/core/subscription/subscriptionPricing';
import type { AppliedCoupon } from '../types';

const DEFAULT_PRICE = SUBSCRIPTION_BASE_PRICE;

export async function buildCandidateSubscriptionViewModel(input: {
  candidateId: string;
  email: string;
  appliedCouponCode?: string | null;
}) {
  const { candidateId, email, appliedCouponCode } = input;
  const normalizedCouponCode: string | null =
    appliedCouponCode ?? null;


  /* ---------------- Subscription ---------------- */

  const subscriptionReadService = new SubscriptionReadService();
  const activeSubscription =
    await subscriptionReadService.getActiveCandidateSubscription(candidateId);
  const isLockedForReferral = activeSubscription !== null;
    

  const subscription = activeSubscription
    ? {
      isActive: true,
      formattedExpiry: activeSubscription.expiresAt
        ? new Intl.DateTimeFormat('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(activeSubscription.expiresAt)
        : null,
    }
    : {
      isActive: false,
      formattedExpiry: null,
    };

  /* ---------------- Referral ---------------- */

  const referralService = new ReferralService(
    new ReferralRepository()
  );

  // 1. Own Referral Code (Lazy & Guarded)
  // Only generate/show if subscription is active
  let myReferralCode: string | null = null;
  if (activeSubscription) {
    const myReferral = await referralService.getOrCreateReferral(candidateId);
    myReferralCode = myReferral.referralCode;
  }

  // 2. Referrer Code (For Pricing)
  // Safe lookup: Check if I have a referrer without creating my own record
  let referrerCode: string | null = null;
  const referrerId = await referralService.getDirectReferrer(candidateId);

  if (referrerId) {
    const referrerRecord = await referralService.getOrCreateReferral(referrerId);
    referrerCode = referrerRecord.referralCode;
  }

  /* ---------------- Wallet ---------------- */

  const walletService = new WalletService(new WalletRepository());
  const walletSummary = await walletService.getWalletSummary(candidateId);

  /* ---------------- Pricing & Coupon ---------------- */

  let pricingSource: 'DEFAULT' | 'REFERRAL' | 'COUPON' | null = null;
  let appliedCoupon: AppliedCoupon | null = null;

  // 1. Try Coupon (if provided in URL)
  if (!subscription.isActive && appliedCouponCode) {
    const result = await validateCouponAction(
      candidateId,
      appliedCouponCode
    );

    if (result.ok) {
      pricingSource = 'COUPON';
      appliedCoupon = result.data;
    }
  }

  // 2. Fallback to Referral (if no coupon applied/valid AND referrer exists)
  if (!subscription.isActive && pricingSource === null && referrerCode) {
    pricingSource = 'REFERRAL';
  }

  if (!subscription.isActive && pricingSource === null) {
    pricingSource = 'DEFAULT';
  }

  /* ---------------- Payment ---------------- */

  const canSubscribe = !subscription.isActive;

  /* ---------------- View Model ---------------- */

  return {
    subscription,

    referral: {
      code: myReferralCode ?? '—',
      isLocked: isLockedForReferral,
      referrerCode,
    },

    wallet: {
      pendingCredits: walletSummary.pending,
    },

    pricing: {
      defaultPrice: DEFAULT_PRICE,
      referralPrice: SUBSCRIPTION_REFERRAL_PRICE,
      finalPrice: null,
      pricingSource,
    },

    coupon: {
      inputValue: normalizedCouponCode ?? '',
      appliedCoupon,
      isApplying: false,
    },

    payment: {
      canSubscribe: !subscription.isActive,
      isProcessing: false,
    },

  };
}
