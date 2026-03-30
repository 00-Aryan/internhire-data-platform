import React from 'react';

interface SubscriptionStatusSectionProps {
  subscription: {
    formattedExpiry: string | null;
  };
}

export default function SubscriptionStatusSection({ subscription }: SubscriptionStatusSectionProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-base font-medium text-gray-900 mb-1">

        {subscription.formattedExpiry && (
          <span className="text-sm text-gray-500 ml-1">
            ( Valid till: {subscription.formattedExpiry} )
          </span>
        )}
      </h2>

      <p className="text-sm text-gray-600 mt-2">
        Industry Readiness score • Unlimited assessments • Explore and apply to internships
      </p>
    </div>
  );
}