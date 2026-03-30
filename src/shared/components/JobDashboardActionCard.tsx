'use client';

import React from 'react';
import clsx from 'clsx';

interface JobDashboardActionCardProps {
  title: string;
  company: string;
  meta: React.ReactNode;
  action: React.ReactNode;
  onClick?: () => void;
  isStatus?: boolean;
  actionVariant?: 'icon' | 'button';
  className?: string;
}

export default function JobDashboardActionCard({
  title,
  company,
  meta,
  action,
  onClick,
  isStatus = false,
  actionVariant = 'icon',
  className,
}: JobDashboardActionCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        `
        bg-white border border-gray-200 rounded-3xl p-8
        cursor-pointer
        hover:shadow-xl hover:scale-[1.02] hover:border-gray-300
        transition-all duration-300 group
        `,
        className
      )}
    >
      <div className="flex items-center justify-between">
        {/* Left content */}
        <div className="pr-16">
          <h3 className="text-2xl font-bold text-black mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-lg text-gray-800 mb-2">{company}</p>
          <p className="text-sm text-gray-600">{meta}</p>
        </div>

        {/* Right action */}
        {actionVariant === 'button' ? (
          <div className="flex-shrink-0">
            {action}
          </div>
        ) : (
          <div
            className={clsx(
              `
              bg-gray-50 rounded-full w-14 h-14
              flex items-center justify-center
              transition-all duration-300
              flex-shrink-0
              `,
              !isStatus && `
                group-hover:bg-blue-600
                group-hover:text-white
              `
            )}
          >
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
