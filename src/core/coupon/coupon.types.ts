export type CouponType = 'FLAT' | 'PERCENT';

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
}
