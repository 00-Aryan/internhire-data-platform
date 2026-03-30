import { Coupon } from './coupon.types';

export interface CouponRepository {
  findByCode(code: string): Promise<Coupon | null>;
}

/* TEMP — replace with Prisma later */
export class InMemoryCouponRepository implements CouponRepository {
  private coupons: Coupon[] = [
    { code: 'PROMO100', type: 'FLAT', value: 100 },
    { code: 'PROMO20', type: 'PERCENT', value: 20 },
  ];

  async findByCode(code: string): Promise<Coupon | null> {
    return this.coupons.find(c => c.code === code) ?? null;
  }
}
