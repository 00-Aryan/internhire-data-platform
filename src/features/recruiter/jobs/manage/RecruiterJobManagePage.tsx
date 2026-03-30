'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RecruiterJobForm from '../RecruiterJobForm';
import { RecruiterJobFormProps } from '../types';

export default function RecruiterJobManagePage({ initialJob }: RecruiterJobFormProps) {
  const router = useRouter();
  const [applicantCount, setApplicantCount] = useState(0);
  const [daysActive, setDaysActive] = useState(0);

  useEffect(() => {
    if (initialJob?.id) {
      // Fetch applicant count
      fetch(`/api/jobs/${initialJob.id}/applications/count`)
        .then((res) => res.json())
        .then((data) => setApplicantCount(data.count || 0))
        .catch(() => setApplicantCount(0));

      // Calculate days active
      const createdAt = new Date(initialJob.createdAt);
      const now = new Date();
      const days = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      setDaysActive(Math.max(0, days));
    }
  }, [initialJob?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{initialJob?.title}</h1>
              <p className="mt-1 text-sm text-gray-600">
                Editing job posting
              </p>
            </div>
            <div className="flex gap-2">
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {initialJob?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{applicantCount}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-600">Days Active</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{daysActive}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-600">Posted Date</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {new Date(initialJob?.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RecruiterJobForm initialJob={initialJob} />
      </div>
    </div>
  );
}
