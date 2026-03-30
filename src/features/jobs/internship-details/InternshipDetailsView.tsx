import InternshipHeader from './sections/InternshipHeader';
import InternshipMetaGrid from './sections/InternshipMetaGrid';
import InternshipDescription from './sections/InternshipDescription';
import InternshipTimeline from './sections/InternshipTimeline';
import InternshipSkills from './sections/InternshipSkills';
import InternshipContact from './sections/InternshipContact';
import InternshipApplySection from './sections/InternshipApplySection';

interface InternshipDetailsViewProps {
  job: any;
  candidateProfile: any;
  hasApplied: boolean;
  applicationStatus: string | null;
  canApply: boolean;
}

export default function InternshipDetailsView({
  job,
  candidateProfile,
  hasApplied,
  applicationStatus,
  canApply,
}: InternshipDetailsViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <InternshipHeader job={job} />
      <InternshipMetaGrid job={job} />
      <InternshipDescription job={job} />
      <InternshipTimeline job={job} />
      <InternshipSkills job={job} />
      <InternshipContact job={job} />
      <InternshipApplySection
        job={job}
        candidateProfile={candidateProfile}
        hasApplied={hasApplied}
        applicationStatus={applicationStatus}
        canApply={canApply}
      />
    </div>
  );
}
