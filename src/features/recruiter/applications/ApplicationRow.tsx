'use client';

import Link from 'next/link';

interface ApplicationRowProps {
  applicationId: string;
  candidateName: string;
  candidateInitial: string;
  educationDisplay: string;
  jobTitle: string;
  jobLocation: string;
  appliedDate: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | string;
}

export function ApplicationRow({
  applicationId,
  candidateName,
  candidateInitial,
  educationDisplay,
  jobTitle,
  jobLocation,
  appliedDate,
  status,
}: ApplicationRowProps) {
  return (
    <Link
      href={`/recruiter/applications/${applicationId}`}
      className="block hover:bg-blue-50 transition duration-150 ease-in-out group"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
        {/* Candidate Name & Info */}
        <div className="col-span-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
            {candidateInitial}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700">
              {candidateName}
            </p>
            <p className="text-xs text-gray-500">{educationDisplay}</p>
          </div>
        </div>

        {/* Job Title */}
        <div className="col-span-4">
          <p className="text-sm text-gray-700 font-medium">{jobTitle}</p>
          <p className="text-xs text-gray-400">{jobLocation}</p>
        </div>

        {/* Date */}
        <div className="col-span-2">
          <p className="text-sm text-gray-500">{appliedDate}</p>
        </div>

        {/* Status Badge */}
        <div className="col-span-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${status === 'APPLIED' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${status === 'SHORTLISTED' ? 'bg-green-100 text-green-800' : ''}
              ${status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
            `}
          >
            {status}
          </span>
        </div>
      </div>
    </Link>
  );
}
