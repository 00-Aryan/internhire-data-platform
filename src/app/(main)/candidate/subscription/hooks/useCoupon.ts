'use client';

import { useState } from 'react';
import { validateCouponAction } from '../actions/validateCoupon.action';
import { useNotification } from '@/shared/notifications/useNotification';
import type { AppliedCoupon } from '../types';

export function useCoupon(
  candidateId: string,
  candidateEmail: string,
  defaultPrice: number,
  initialAppliedCoupon: AppliedCoupon | null
) {
  const { showCustomSuccess } = useNotification();
  
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [applied, setApplied] = useState<AppliedCoupon | null>(initialAppliedCoupon);

  const apply = async () => {
    if (!code.trim()) return;
    
    setIsValidating(true);
    
    const res = await validateCouponAction(candidateId, candidateEmail, code);
    
    setIsValidating(false);

    if (res.ok && typeof res.finalPrice === 'number' && res.code) {
      const discount = defaultPrice - res.finalPrice;
      setApplied({
        code: res.code,
        finalPrice: res.finalPrice,
        discountAmount: discount,
      });
      setCode(''); // Clear input on success
      showCustomSuccess('Coupon Applied', `You saved ₹${discount}!`);
    } else {
      setApplied(null);
      const msg = !res.ok ? res.message : 'This code could not be applied.';
      showCustomSuccess('Invalid Coupon', msg || 'This code could not be applied.');
    }
  };

  const remove = () => {
    setApplied(null);
    setCode('');
  };

  return {
    code,
    applied,
    isValidating,
    previewPrice: applied ? applied.finalPrice : null,
    setCode,
    apply,
    remove,
  };
}