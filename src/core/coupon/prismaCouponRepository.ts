import { prisma } from '@/infra/db/prisma.client';
import { CouponRepository } from './couponRepository';
import { Coupon } from './coupon.types';

export class PrismaCouponRepository implements CouponRepository {
  async findByCode(code: string): Promise<Coupon | null> {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) return null;
    if (!coupon.isActive) return null;
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return null;

    return {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    };
  }
}
