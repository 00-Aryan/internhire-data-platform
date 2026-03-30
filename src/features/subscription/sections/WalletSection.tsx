import React from 'react';

interface WalletSectionProps {
  wallet: {
    pendingCredits: number;
  };
}

export default function WalletSection({ wallet }: WalletSectionProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium text-gray-900">
            Your wallet : ₹{wallet.pendingCredits}
          </h3>

          <p className="text-sm text-gray-600 mt-2">
            Any affiliate incentive that you get will be added to your wallet within 24 hours
          </p>
        </div>

        <button className="text-sm px-4 py-1.5 rounded-full bg-gray-900 text-white hover:bg-gray-800">
          withdraw
        </button>
      </div>
    </div>
  );
}