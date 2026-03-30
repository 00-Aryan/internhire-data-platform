'use client';

import PaymentButton from '@/features/payments/components/PaymentButton';

interface PricingSectionProps {
  pricing: {
    defaultPrice: number;
    finalPrice: number | null;
  };
  payment: {
    canSubscribe: boolean;
  };
  candidateId: string;
  candidateEmail: string;
  referralCode?: string | null;
  couponCode?: string | null;
  children?: React.ReactNode;
}

export default function PricingSection({
  pricing,
  payment,
  candidateId,
  candidateEmail,
  referralCode,
  couponCode,
  children,
}: PricingSectionProps) {
  if (!payment.canSubscribe) return null;

  const isDiscounted = pricing.finalPrice !== null;
  const payableAmount = pricing.finalPrice ?? pricing.defaultPrice;
  const savings = isDiscounted
    ? pricing.defaultPrice - pricing.finalPrice!
    : 0;

  return (
    <div className="bg-white rounded-xl p-6 space-y-6">
      {/* Pricing summary */}
      <div className="space-y-2">
        {/* Base price */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base price</span>
          <span
            className={
              isDiscounted
                ? 'text-gray-400 line-through'
                : 'text-gray-900 font-medium'
            }
          >
            ₹{pricing.defaultPrice}
          </span>
        </div>

        {/* Discounted price */}
        {isDiscounted && (
          <div className="flex justify-between text-sm font-semibold text-green-700">
            <span>Discounted price</span>
            <span>₹{pricing.finalPrice}</span>
          </div>
        )}

        {/* Savings */}
        {isDiscounted && (
          <div className="text-xs text-green-600 text-right">
            You save ₹{savings}
          </div>
        )}
      </div>

      {/* Payment */}
      <PaymentButton
        candidateId={candidateId}
        candidateEmail={candidateEmail}
        referralCode={referralCode}
        couponCode={couponCode}
      />

      {children}
    </div>
  );
}
