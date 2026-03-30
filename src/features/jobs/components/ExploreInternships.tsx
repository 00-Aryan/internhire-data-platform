// src/features/jobs/components/ExploreInternships.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JobDashboardActionCard from '@/shared/components/JobDashboardActionCard';

// Type definition for job with relations
interface JobWithRelations {
  id: string;
  title: string;
  description: string;
  type: string;
  workMode: string;
  locationCity: string | null;
  isPaid: boolean;
  stipendAmount: number | null;
  recruiter: {
    establishment: {
      name: string;
    };
  };
}

export default function ExploreInternships() {
  const router = useRouter();

  const [jobs, setJobs] = useState<JobWithRelations[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch jobs
        const jobsResponse = await fetch('/api/candidate/jobs');
        if (!jobsResponse.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);

        // Fetch user's applications
        const applicationsResponse = await fetch('/api/candidate/applications');
        if (applicationsResponse.ok) {
          const appData = await applicationsResponse.json();
          setAppliedJobIds(new Set(appData.jobIds || []));
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load internships. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Available internships
        </h1>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-gray-600">
        Showing {jobs.length} {jobs.length === 1 ? 'position' : 'positions'}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Loading internships…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <p className="text-red-800 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Job Cards */}
      {!loading && !error && (
        <div className="space-y-6">
          {jobs.map((job) => {
            const hasApplied = appliedJobIds.has(job.id);

            const meta = [
              job.locationCity || 'Remote',
              job.workMode === 'IN_OFFICE' ? 'Full-time' : 'Part-time',
              job.isPaid
                ? `₹ ${job.stipendAmount || 5000} per month`
                : 'Unpaid',
            ].join(' | ');

            return (
              <JobDashboardActionCard
                key={job.id}
                title={job.title}
                company={job.recruiter?.establishment?.name || 'Company'}
                meta={meta}
                isStatus={hasApplied}
                onClick={() => {
                  if (!hasApplied) {
                    router.push(`/candidate/internships/details/${job.id}`);
                  }
                }}
                action={
                  hasApplied ? (
                    <span
                      className="
          text-sm text-gray-700
          group-hover:font-bold
          transition-all duration-200
        "
                    >
                      Applied
                    </span>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )
                }
              />
            );
          })}

          {/* Empty State */}
          {jobs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                No internships available at the moment.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Check back soon for new opportunities!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
