interface InternshipMetaGridProps {
  job: any;
}

export default function InternshipMetaGrid({ job }: InternshipMetaGridProps) {
  const formatWorkMode = (mode: string) => {
    const modes: Record<string, string> = {
      IN_OFFICE: 'In Office',
      HYBRID: 'Hybrid',
      REMOTE_ANYWHERE: 'Remote (Anywhere)',
      REMOTE_SPECIFIC_CITY: 'Remote (Specific City)',
      FIELD_WORK: 'Field Work',
    };
    return modes[mode] || mode;
  };

  const formatJobType = (type: string) => {
    const types: Record<string, string> = {
      INTERNSHIP: 'Internship',
      PROJECT_WORK: 'Project Work',
      FULL_TIME: 'Full-Time Position',
    };
    return types[type] || type;
  };

  const formatStipendFrequency = (frequency: string | null) => {
    if (!frequency) return '/month';
    const frequencies: Record<string, string> = {
      MONTHLY: '/month',
      WEEKLY: '/week',
      ONE_TIME: ' (one-time)',
      PERFORMANCE_BASED: ' (performance-based)',
    };
    return frequencies[frequency] || '';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
      <div className="p-6 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Type</p>
        <p className="font-semibold text-black">
          {formatJobType(job.type)}
        </p>
      </div>

      <div className="p-6 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          Work Mode
        </p>
        <p className="font-semibold text-black">
          {formatWorkMode(job.workMode)}
        </p>
      </div>

      <div className="p-6 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          Stipend
        </p>
        <p className="font-semibold text-black">
          {job.isPaid && job.stipendAmount
            ? `₹${job.stipendAmount}${formatStipendFrequency(
                job.stipendFrequency
              )}`
            : job.isPaid
            ? 'Paid'
            : 'Unpaid'}
        </p>
      </div>

      <div className="p-6 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          Location
        </p>
        <p className="font-semibold text-black">
          {[job.locationCity, job.locationDistrict, job.locationState]
            .filter(Boolean)
            .join(', ') || 'Remote'}
        </p>
      </div>
    </div>
  );
}
