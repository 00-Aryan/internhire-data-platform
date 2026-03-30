'use client';

interface CandidateSkillsSectionProps {
  skills: any[];
}

export default function CandidateSkillsSection({
  skills,
}: CandidateSkillsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Skills</h2>

      {skills && skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((candidateSkill) => (
            <span
              key={candidateSkill.id}
              className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-medium"
            >
              {candidateSkill.skill.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No skills listed.</p>
      )}
    </div>
  );
}
