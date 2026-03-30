import React from 'react';

interface CouponSectionProps {
  coupon: {
    inputValue: string;
    appliedCouponCode: string | null;
    isApplying: boolean;
    onChange: (value: string) => void;
    onApply: () => Promise<void>;
  };
}


export default function CouponSection({ coupon }: CouponSectionProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
      <input
        value={coupon.inputValue}
        onChange={(e) => coupon.onChange(e.target.value)}
        placeholder="type refer code / coupon code"
        className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
      />

      <button
        onClick={coupon.onApply}
        disabled={coupon.isApplying}
        className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-sm hover:bg-gray-800"
      >
        apply code 
      </button>
    </div>
  );
}