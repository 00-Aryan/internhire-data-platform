'use client';

import JobDashboardActionCard from '@/shared/components/JobDashboardActionCard';
import Tooltip from '@/shared/components/Tooltip';

interface PostedJobCardProps {
  id: string;
  title: string;
  company: string;
  meta: string;
  applicationsCount: number;
  onViewApplications: () => void;
}

export default function PostedJobCard({
  title,
  company,
  meta,
  applicationsCount,
  onViewApplications,
}: PostedJobCardProps) {
  const hasApplications = applicationsCount > 0;

  const tooltipText =
    applicationsCount === 1
      ? '1 applicant has applied to this job'
      : `${applicationsCount} applicants have applied to this job`;

  return (
    <div className="relative">
      {hasApplications && (
        <div className="absolute top-4 right-4 z-20">
          <Tooltip content={tooltipText}>
            <span
              className="block h-2.5 w-2.5 rounded-full bg-red-500"
              aria-label={tooltipText}
            />
          </Tooltip>
        </div>
      )}

      <JobDashboardActionCard
        title={title}
        company={company}
        meta={meta}
        onClick={onViewApplications}
        actionVariant="button"
        action={
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewApplications();
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition text-sm whitespace-nowrap"
          >
            view applications
          </button>
        }
      />
    </div>
  );
}
