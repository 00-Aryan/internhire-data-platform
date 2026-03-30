interface InternshipTimelineProps {
  job: any;
}

export default function InternshipTimeline({ job }: InternshipTimelineProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="p-8 border-b border-gray-100">
      <h3 className="text-lg font-bold text-black mb-6">Timeline</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Apply By
          </p>
          <p className="font-mono font-medium text-black">
            {formatDate(job.deadline)}
          </p>
        </div>

        {job.startDate && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Start Date
            </p>
            <p className="font-mono font-medium text-black">
              {formatDate(job.startDate)}
            </p>
          </div>
        )}

        {job.endDate && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              End Date
            </p>
            <p className="font-mono font-medium text-black">
              {formatDate(job.endDate)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
