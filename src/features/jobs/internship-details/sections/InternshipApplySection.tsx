import ApplyButton from '@/shared/components/ApplyButton';

interface InternshipApplySectionProps {
  job: any;
  candidateProfile: any;
  hasApplied: boolean;
  applicationStatus: string | null;
  canApply: boolean;
}

export default function InternshipApplySection({
  job,
  candidateProfile,
  hasApplied,
  applicationStatus,
  canApply,
}: InternshipApplySectionProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (hasApplied) {
    return (
      <div className="p-8 border-t border-gray-200 text-center">
        <div className="inline-block px-6 py-3 rounded-lg font-medium border bg-gray-50 border-gray-200 text-gray-800">
          {applicationStatus === 'SHORTLISTED' && 'Shortlisted'}
          {applicationStatus === 'REJECTED' && 'Not Selected'}
          {applicationStatus === 'HIRED' && 'Hired'}
          {applicationStatus === 'APPLIED' && 'Application Sent'}
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Applied on {formatDate(job.applications[0].appliedAt)}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 border-t border-gray-200">
      <ApplyButton
        jobId={job.id}
        candidateId={candidateProfile.id}
        initialHasApplied={false}
        jobTitle={job.title}
        companyName={job.recruiter.establishment.name}
        canApply={canApply}
      />
    </div>
  );
}
