'use client';

import Link from 'next/link';
import ApplicationHeader from './components/ApplicationHeader';
import CandidateScoreSection from './components/CandidateScoreSection';
import CandidateExperienceSection from './components/CandidateExperienceSection';
import CandidateEducationSection from './components/CandidateEducationSection';
import CandidateSkillsSection from './components/CandidateSkillsSection';

interface ApplicationDetailViewProps {
  application: any;
  jobId: string;
}

export default function ApplicationDetailView({
  application,
  jobId,
}: ApplicationDetailViewProps) {
  const { candidate } = application;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        href={`/recruiter/jobs/${jobId}/applications`}
        className="text-gray-500 hover:text-gray-900 text-sm mb-6 inline-block"
      >
        &larr; Back to Applications
      </Link>

      {/* SECTION ORDERING (LOCKED) */}
      <ApplicationHeader application={application} candidate={candidate} />
      <CandidateScoreSection candidate={candidate} />
      <CandidateExperienceSection experience={candidate.experience} />
      <CandidateEducationSection candidate={candidate} />
      <CandidateSkillsSection skills={candidate.skills} />
    </div>
  );
}
