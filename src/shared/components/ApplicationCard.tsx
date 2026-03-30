'use client';

import React from 'react';
import clsx from 'clsx';

interface ApplicationCardProps {
  title: string;
  company: string;
  meta: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  appliedAt: Date;
  onClick?: () => void;
}

export default function ApplicationCard({
  title,
  company,
  meta,
  status,
  appliedAt,
  onClick,
}: ApplicationCardProps) {
  const statusLabel = {
    APPLIED: 'Application Submitted',
    SHORTLISTED: 'Shortlisted',
    REJECTED: 'Not Selected',
    HIRED: 'Hired',
  }[status];

  const statusStyle = {
    APPLIED: 'bg-blue-100 text-blue-800',
    SHORTLISTED: 'bg-[#4ADE80] text-white',
    REJECTED: 'bg-red-100 text-red-800',
    HIRED: 'bg-green-600 text-white',
  }[status];

  return (
    <div
      onClick={onClick}
      className={clsx(
        `
        bg-white border border-gray-200 rounded-3xl p-8
        hover:shadow-xl hover:scale-[1.01] hover:border-gray-300
        transition-all duration-300 relative group
        `,
        onClick && 'cursor-pointer'
      )}
    >
      {/* Shortlisted badge (top-right) */}
      {status === 'SHORTLISTED' && (
        <div className="absolute top-4 right-20">
          <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold bg-[#4ADE80] text-white">
            Shortlisted
          </span>
        </div>
      )}

      {/* Arrow */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2">
        <div
          className="
            bg-gray-50 rounded-full w-14 h-14
            flex items-center justify-center
            group-hover:bg-blue-600 group-hover:text-white
            transition-all duration-300
          "
        >
          <span className="text-2xl">→</span>
        </div>
      </div>

      {/* Content */}
      <div className="pr-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h2>

        <p className="text-lg text-gray-800 mb-3">{company}</p>

        <div className="text-gray-700 text-sm">{meta}</div>

        {/* Status (non-shortlisted) */}
        {status !== 'SHORTLISTED' && (
          <div className="mt-4">
            <span
              className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${statusStyle}`}
            >
              {statusLabel}
            </span>
          </div>
        )}

        {/* Applied date */}
        <div className="mt-2 text-xs text-gray-600">
          Applied on{' '}
          {appliedAt.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>
    </div>
  );
}
