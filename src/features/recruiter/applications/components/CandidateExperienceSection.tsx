'use client';

interface CandidateExperienceSectionProps {
  experience: any[] | null | undefined;
}

export default function CandidateExperienceSection({
  experience,
}: CandidateExperienceSectionProps) {
  const hasExperience =
    experience && Array.isArray(experience) && experience.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Work Experience</h2>

      {hasExperience ? (
        <ul className="space-y-3">
          {experience.map((exp: any) => (
            <li key={exp.id} className="text-gray-700">
              <span className="font-medium">{exp.jobTitle || 'N/A'}</span> —{' '}
              <span>{exp.companyName || 'N/A'}</span>
              {exp.startDate && exp.endDate && (
                <span className="ml-2 text-sm text-gray-500">
                  ({new Date(exp.startDate).getFullYear()} -{' '}
                  {new Date(exp.endDate).getFullYear()})
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No prior work experience (Fresher)</p>
      )}
    </div>
  );
}
