import { ReferralService } from '@/core/referral/referralService';
import { WalletService } from '@/core/wallet/walletService';
import { CouponResolver } from '@/core/coupon/couponResolver';
import { SUBSCRIPTION_BASE_PRICE } from './subscriptionPricing';

/* ---------- Types ---------- */

export enum PricingSource {
  DEFAULT = 'DEFAULT',
  REFERRAL = 'REFERRAL',
  COUPON = 'COUPON',
}

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  FAILED = 'FAILED',
}

export interface SubscriptionDTO {
  id: string;
  candidateId: string;
  pricePaid: number;
  pricingSource: PricingSource;
  status: SubscriptionStatus;
  startedAt: Date | null;
  expiresAt: Date;
  appliedCouponCode?: string;
}

export interface CreateSubscriptionInput {
  candidateId: string;
  candidateEmail: string;
  referralCode?: string;
  couponCode?: string;
}

export interface ISubscriptionRepository {
  findFirstActiveByCandidate(candidateId: string): Promise<SubscriptionDTO | null>;
  create(data: {
    candidateId: string;
    pricePaid: number;
    pricingSource: PricingSource;
    status: SubscriptionStatus;
    expiresAt: Date;
    appliedCouponCode?: string;
  }): Promise<SubscriptionDTO>;
  activate(subscriptionId: string): Promise<SubscriptionDTO>;
}

/* ---------- Service ---------- */

export class SubscriptionService {
  private couponResolver = new CouponResolver();

  constructor(
    private subscriptionRepo: ISubscriptionRepository,
    private referralService: ReferralService,
    private walletService: WalletService
  ) {}

  async getActiveSubscription(candidateId: string): Promise<SubscriptionDTO | null> {
    return this.subscriptionRepo.findFirstActiveByCandidate(candidateId);
  }

  /**
   * STEP 1: Create PENDING subscription (pricing resolved here)
   */
  async createPendingSubscription(
    input: CreateSubscriptionInput
  ): Promise<SubscriptionDTO> {
    const { candidateId, candidateEmail, referralCode, couponCode } = input;

    const existing =
      await this.subscriptionRepo.findFirstActiveByCandidate(candidateId);

    if (existing) {
      throw new Error('Candidate already has an active subscription');
    }

    // 1. Try to link referrer if code is provided
    if (referralCode) {
      try {
        await this.referralService.setReferrer(candidateId, referralCode);
      } catch (error) {
        console.warn(`[CreateSubscription] Could not set referrer: ${error}`);
      }
    }

    // 2. Check eligibility: Do they have a referrer linked? (New or Existing)
    const referrerId = await this.referralService.getDirectReferrer(candidateId);
    const referralEligible = !!referrerId;

    // College eligibility (policy only)
    const isCollegeEligible =
      candidateEmail.toLowerCase().endsWith('@smail.iitm.ac.in');

    /**
     * Sanitized coupon input for pricing
     *
     * Rules:
     * 1. User-entered coupons are allowed EXCEPT private ones
     * 2. Private coupons (college) are injected ONLY by policy
     */
    let effectiveCouponCode: string | undefined;

    if (couponCode && couponCode !== 'COLLEGE_IITM') {
      // Public coupon entered by user
      effectiveCouponCode = couponCode;
    } else if (isCollegeEligible) {
      // Private coupon injected by policy
      effectiveCouponCode = 'COLLEGE_IITM';
    }

    const pricing = await this.couponResolver.resolve({
      basePrice: SUBSCRIPTION_BASE_PRICE,
      referralEligible,
      couponCode: effectiveCouponCode,
    });
    console.info('[SUBSCRIPTION_SERVICE][PRICING_RESOLVED]', pricing);

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return this.subscriptionRepo.create({
      candidateId,
      pricePaid: pricing.finalPrice,
      pricingSource: pricing.pricingSource,
      status: SubscriptionStatus.PENDING,
      expiresAt,
      appliedCouponCode: pricing.appliedCouponCode,
    });
  }

  /**
   * Validate a coupon code for UI preview
   */
  async validateCoupon(
    candidateId: string,
    candidateEmail: string,
    couponCode: string
  ): Promise<{
    isValid: boolean;
    finalPrice: number;
    pricingSource: PricingSource;
    appliedCouponCode?: string;
  }> {
    const referrerId = await this.referralService.getDirectReferrer(candidateId);
    const referralEligible = !!referrerId;
    const isCollegeEligible = candidateEmail.toLowerCase().endsWith('@smail.iitm.ac.in');

    // Mirror logic: Private coupons are only valid if eligible
    if (couponCode === 'COLLEGE_IITM' && !isCollegeEligible) {
      return { isValid: false, finalPrice: SUBSCRIPTION_BASE_PRICE, pricingSource: PricingSource.DEFAULT };
    }

    const pricing = await this.couponResolver.resolve({
      basePrice: SUBSCRIPTION_BASE_PRICE,
      referralEligible,
      couponCode,
    });

    return {
      isValid: !!pricing.appliedCouponCode && pricing.appliedCouponCode === couponCode,
      finalPrice: pricing.finalPrice,
      pricingSource: pricing.pricingSource,
      appliedCouponCode: pricing.appliedCouponCode,
    };
  }

  /**
   * STEP 2: Activate after payment
   */
  async activatePendingSubscription(
    subscriptionId: string
  ): Promise<SubscriptionDTO> {
    const active = await this.subscriptionRepo.activate(subscriptionId);

    await this.referralService.lockReferral(active.candidateId);

    await this.handleReferralRewards({
      candidateId: active.candidateId,
      subscriptionId: active.id,
      pricePaid: active.pricePaid,
      pricingSource: active.pricingSource,
    });

    return active;
  }

  /* ---------- Referral Rewards ---------- */

  private async handleReferralRewards(params: {
    candidateId: string;
    subscriptionId: string;
    pricePaid: number;
    pricingSource: PricingSource;
  }): Promise<void> {
    const { candidateId, subscriptionId, pricePaid, pricingSource } = params;

    if (pricingSource !== PricingSource.REFERRAL) return;
    if (pricePaid <= 0) return;

    const chain =
      await this.referralService.getReferralChainForRewards(candidateId);

    if (chain.length === 0) return;

    const level1 = chain.find(c => c.level === 1);
    if (level1) {
      await this.walletService.createPendingReward({
        candidateId: level1.candidateId,
        amount: 40,
        level: 1,
        subscriberCandidateId: candidateId,
        subscriptionId,
      });
    }

    const level2 = chain.find(c => c.level === 2);
    if (level1 && level2) {
      await this.walletService.createPendingReward({
        candidateId: level2.candidateId,
        amount: 10,
        level: 2,
        subscriberCandidateId: candidateId,
        subscriptionId,
      });
    }
  }
}
