import { PricingSource } from '@/core/subscription/subscriptionService';
import { CouponRepository } from './couponRepository';
import { PrismaCouponRepository } from './prismaCouponRepository';
import { Coupon } from './coupon.types';

export interface ResolveCouponInput {
  basePrice: number;
  referralEligible: boolean;
  couponCode?: string;
}

export interface ResolvedPrice {
  finalPrice: number;
  pricingSource: PricingSource;
  appliedCouponCode?: string;
}

export class CouponResolver {
  constructor(
    private couponRepo: CouponRepository = new PrismaCouponRepository()
  ) {}

  async resolve(input: ResolveCouponInput): Promise<ResolvedPrice> {
    const { basePrice, referralEligible, couponCode } = input;

    /**
     * 1️⃣ Coupon pricing (highest priority)
     * Coupon ALWAYS overrides referral if valid
     */
    if (couponCode) {
      const coupon = await this.couponRepo.findByCode(couponCode);

      if (coupon) {
        return this.applyCoupon(basePrice, coupon);
      }
    }

    /**
     * 2️⃣ Referral pricing (only if no coupon applied)
     */
    if (referralEligible) {
      return {
        finalPrice: 365,
        pricingSource: PricingSource.REFERRAL,
      };
    }

    /**
     * 3️⃣ Default pricing
     */
    return {
      finalPrice: basePrice,
      pricingSource: PricingSource.DEFAULT,
    };
  }

  private applyCoupon(basePrice: number, coupon: Coupon): ResolvedPrice {
    const finalPrice =
      coupon.type === 'FLAT'
        ? Math.max(basePrice - coupon.value, 0)
        : Math.round(basePrice * (1 - coupon.value / 100));

    return {
      finalPrice,
      pricingSource: PricingSource.COUPON,
      appliedCouponCode: coupon.code,
    };
  }
}
