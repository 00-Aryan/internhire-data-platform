'use client';

import { ReactNode } from 'react';
import JobDashboardActionCard from '@/shared/components/JobDashboardActionCard';

interface DraftJobCardProps {
  id: string;
  title: string;
  company: string;
  meta: ReactNode;
  createdAt: Date;
  onClick?: () => void;
}

function DraftIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-gray-500"
    >
      <path
        d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v4h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 11h8M8 15h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DraftJobCard({
  title,
  company,
  meta,
  createdAt,
  onClick,
}: DraftJobCardProps) {
  return (
    <JobDashboardActionCard
      title={title}
      company={company}
      meta={
        <span className="flex flex-col gap-1">
          <span>{meta}</span>
          <span className="text-sm text-gray-500">
            Draft created on{' '}
            {createdAt.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </span>
      }
      onClick={onClick}
      isStatus
      action={<DraftIcon />}
    />
  );
}
