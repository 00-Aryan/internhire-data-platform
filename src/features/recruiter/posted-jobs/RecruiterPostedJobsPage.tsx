'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useRecruiterPostedJobs } from './hooks/useRecruiterPostedJobs';
import { formatJobType } from '@/core/jobs/jobFormatters';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface RecruiterProfileResponse {
  recruiterProfile: {
    id: string;
  } | null;
  readiness: {
    canPostJob: boolean;
    missing: string[];
    reason: string | null;
  };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function RecruiterPostedJobsPage() {
  const [profileLoading, setProfileLoading] = useState(true);
  const [canPostJob, setCanPostJob] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  /* ---------------- Fetch server-computed readiness ---------------- */

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/recruiter/profile');
        if (!res.ok) return;

        const data: RecruiterProfileResponse = await res.json();

        setCanPostJob(data.readiness?.canPostJob ?? false);
        setMissingFields(data.readiness?.missing ?? []);
      } catch (error) {
        console.error('Failed to fetch recruiter profile', error);
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, []);

  /* ---------------- Fetch jobs (no readiness logic here) ---------------- */

  const {
    jobs,
    loading,
    error,
    formatStipend,
  } = useRecruiterPostedJobs(); // ✅ no args

  /* ---------------- Loading state ---------------- */

  if (profileLoading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black tracking-tight">
          Posted Internships (Live)
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your live job postings and view applicant stats.
        </p>
      </div>

      {/* Not ready message */}
      {!canPostJob && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <h3 className="text-yellow-800 font-semibold text-lg mb-2">
            Action Required: Complete Your Profile
          </h3>

          <p className="text-yellow-700 text-sm mb-3">
            You can still create drafts, but to publish live jobs, please complete the following:
          </p>

          {missingFields.length > 0 && (
            <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1 mb-4 bg-yellow-100/50 p-3 rounded-lg border border-yellow-100">
              {missingFields.map((field) => (
                <li key={field} className="font-medium">
                  {field}
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/recruiter/profile/edit"
            className="text-sm font-semibold text-yellow-900 underline hover:text-yellow-950 transition-colors"
          >
            Go to Profile Settings →
          </Link>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">
            Loading your posted internships…
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {/* Posted jobs list */}
      {!loading && !error && jobs.length > 0 && (
        <div className="grid gap-4">
          {jobs.map((job) => {
            const applicationsCount = job._count?.applications || 0;

            return (
              <Link
                key={job.id}
                href={`/recruiter/jobs/${job.id}/applications`}
                className="block group"
              >
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:scale-[1.01] transition-all hover:border-green-400">
                  <div className="flex justify-between items-center gap-4">

                    <div>
                      <h2 className="text-xl font-bold text-black group-hover:text-green-700">
                        {job.title}
                      </h2>

                      <div className="flex gap-2 text-sm text-gray-500 mt-1">
                        <span>{job.locationCity || 'Remote'}</span>
                        <span>•</span>
                        <span>{formatJobType(job.type)}</span>
                        <span>•</span>
                        <span>{formatStipend(job.isPaid, job.stipendAmount)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase">Applicants</p>
                      <p className="text-2xl font-black">
                        {applicationsCount}
                      </p>
                    </div>

                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && jobs.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            You haven't posted any live internships yet.
          </p>
        </div>
      )}
    </div>
  );
}
