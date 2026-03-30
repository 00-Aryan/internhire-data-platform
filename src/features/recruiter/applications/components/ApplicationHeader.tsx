'use client';

interface ApplicationHeaderProps {
  application: any;
  candidate: any;
}

export default function ApplicationHeader({
  application,
  candidate,
}: ApplicationHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {candidate.user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {candidate.user.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Applying for{' '}
              <span className="font-semibold">{application.job.title}</span>
            </p>
            <div className="flex gap-4 mt-3 text-sm text-gray-600">
              <span>{candidate.user.email}</span>
              {candidate.user.phone && <span>{candidate.user.phone}</span>}
              {candidate.city && <span>{candidate.city}</span>}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 rounded text-sm font-semibold
              ${
                application.status === 'APPLIED'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }
           `}
          >
            {application.status}
          </span>
          <p className="text-xs text-gray-400 mt-2">
            Applied {new Date(application.appliedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
