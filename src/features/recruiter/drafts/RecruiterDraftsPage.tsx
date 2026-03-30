'use client';

import { useRouter } from 'next/navigation';

import { useRecruiterDrafts } from './hooks/useRecruiterDrafts';
import DraftJobCard from './components/DraftJobCard';
import {
  formatJobType,
  formatWorkMode,
  formatStipend,
} from '@/core/jobs/jobFormatters';

const WorkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


export default function RecruiterDraftsPage() {
  const router = useRouter();

  const {
  jobs,
  loading,
  error,
} = useRecruiterDrafts();

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Your Drafts</h1>
      </div>

      {/* Count */}
      {!loading && !error && (
        <div className="mb-4 text-gray-600">
          Showing {jobs.length} draft {jobs.length === 1 ? 'position' : 'positions'}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading drafts...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-6 rounded-lg mb-6">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Draft list */}
      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-6">
          {jobs.map((job) => (
            <DraftJobCard
              key={job.id}
              id={job.id}
              title={job.title}
              company="Draft (Not Published)"
              meta={
                <span className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1.5">
                    <WorkIcon />
                    {formatWorkMode(job.workMode)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MoneyIcon />
                    {formatStipend(job.isPaid, job.stipendAmount, job.stipendFrequency)}
                  </span>
                </span>
              }
              createdAt={new Date(job.createdAt)}
              onClick={() => router.push(`/recruiter/drafts/jobs/${job.id}`)}
            />

          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && jobs.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No draft jobs found.</p>
          <p className="text-gray-400 text-sm mt-2">
            Create a new job posting to get started!
          </p>
        </div>
      )}
    </div>
  );
}
