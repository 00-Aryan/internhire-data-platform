'use client';

import SubscriptionStatusSection from './sections/SubscriptionStatusSection';
import ReferralSection from './sections/ReferralSection';
import WalletSection from './sections/WalletSection';
import CouponSection from './sections/CouponSection';
import PricingSection from './sections/PricingSection';
import InfoSection from './sections/InfoSection';

import { useCoupon } from '@/app/(main)/candidate/subscription/hooks/useCoupon';
import type { AppliedCoupon } from '@/app/(main)/candidate/subscription/types';

interface CandidateSubscriptionViewProps {
  candidateId: string;
  candidateEmail: string;

  subscription: {
    isActive: boolean;
    formattedExpiry: string | null;
  };

  referral: {
    code: string | null;
    isLocked?: boolean;
    referrerCode?: string | null;
  };

  wallet: {
    pendingCredits: number;
  };

  pricing: {
    defaultPrice: number;
    referralPrice: number;
    finalPrice: number | null;
    pricingSource: 'DEFAULT' | 'REFERRAL' | 'COUPON' | null;
  };

  coupon: {
    inputValue: string;
    appliedCoupon: AppliedCoupon | null;
    isApplying: boolean;
  };
}

export default function CandidateSubscriptionView({
  candidateId,
  candidateEmail,
  subscription,
  referral,
  wallet,
  pricing,
  coupon: initialCouponState,
}: CandidateSubscriptionViewProps) {
  /**
   * Client-only coupon state
   * - validates coupon
   * - does NOT decide price
   */
  const coupon = useCoupon(
    candidateId,
    candidateEmail,
    pricing.defaultPrice,
    initialCouponState.appliedCoupon
  );

  /**
   * Determine codes for payment:
   * 1. If a coupon is applied (manually entered), send it as couponCode.
   * 2. If no coupon, but referral pricing is active, send the referrerCode.
   */
  // NOTE: couponCode is intent-only. Backend may ignore or override.
  const paymentCouponCode = coupon.applied ? coupon.applied.code : null;

  const paymentReferralCode = !coupon.applied ? referral.referrerCode : null;

  /**
   * Calculate effective pricing for display:
   * 1. Coupon (Client Preview): Highest precedence if applied.
   * 2. Referral (Server State): Use referral price if source is REFERRAL.
   * 3. Default: Fallback to default price.
   */
  const effectivePricing = {
    defaultPrice: pricing.defaultPrice,
    finalPrice: pricing.finalPrice ?? coupon.previewPrice ?? null,
  };

  return (
    <div className="bg-gray-50">
      <div className="w-full py-8 px-4 space-y-6">

        {/* Subscription Status */}
        <SubscriptionStatusSection subscription={subscription} />

        {/* Referral */}
        <ReferralSection referral={referral} />

        {/* Wallet */}
        <WalletSection wallet={wallet} />

        {/* Coupon Input */}
        {!subscription.isActive && (
          <CouponSection
            coupon={{
              inputValue: coupon.code,
              appliedCouponCode: coupon.applied?.code ?? null,
              isApplying: coupon.isValidating,
              onChange: coupon.setCode,
              onApply: coupon.apply,
            }}
          />
        )}

        {/* Pricing + Payment */}
        {!subscription.isActive && (
          <PricingSection
            pricing={effectivePricing}
            payment={{ canSubscribe: true }}
            candidateId={candidateId}
            candidateEmail={candidateEmail}
            referralCode={paymentReferralCode}
            couponCode={paymentCouponCode}
          >
            <InfoSection />
          </PricingSection>
        )}
      </div>
    </div>
  );
}
