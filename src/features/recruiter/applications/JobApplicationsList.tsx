'use client';

import { useJobApplications } from './hooks/useJobApplications';
import { ApplicationRow } from './ApplicationRow';

interface JobApplicationsListProps {
  jobId: string;
  jobTitle: string;
}

export function JobApplicationsList({
  jobId,
  jobTitle,
}: JobApplicationsListProps) {
  const { applications, loading, error } = useJobApplications(jobId);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">{jobTitle}</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          Loading applications...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">{jobTitle}</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center text-red-600">
          Error loading applications: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">{jobTitle}</h1>
        <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-bold">
          {applications.length} Applicants
        </span>
      </div>

      {/* List Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header (Hidden on mobile, visible on desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Candidate</div>
          <div className="col-span-4">Applied For</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Status</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {applications.map((app) => (
            <ApplicationRow
              key={app.id}
              applicationId={app.id}
              candidateName={app.candidate.user.name}
              candidateInitial={app.candidate.user.name.charAt(0)}
              educationDisplay={
                app.candidate.pgEducation?.[0]?.courseName ||
                app.candidate.ugEducation?.[0]?.courseName ||
                'Student'
              }
              jobTitle={app.job.title}
              jobLocation={app.job.locationCity}
              appliedDate={new Date(app.appliedAt).toLocaleDateString()}
              status={app.status}
            />
          ))}

          {applications.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No applications received yet for this job.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
