'use client';

import React from 'react';
import clsx from 'clsx';

interface DashboardActionCardProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function DashboardActionCard({
  title,
  icon,
  onClick,
  className,
}: DashboardActionCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        `
        bg-white border border-gray-200 rounded-3xl p-8
        flex items-center cursor-pointer
        hover:shadow-xl hover:scale-[1.02] hover:border-gray-300
        transition-all duration-300 group h-40
        `,
        className
      )}
    >
      <div className="flex items-center justify-between w-full">
        <h3 className="text-2xl font-bold text-black group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        <div
          className="
            bg-gray-50 rounded-full w-14 h-14
            flex items-center justify-center
            group-hover:bg-blue-600 group-hover:text-white
            transition-all duration-300
          "
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
