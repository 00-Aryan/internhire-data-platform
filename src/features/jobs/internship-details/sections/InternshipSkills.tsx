interface InternshipSkillsProps {
  job: any;
}

export default function InternshipSkills({ job }: InternshipSkillsProps) {
  if (!job.requiredSkills || job.requiredSkills.length === 0) {
    return null;
  }

  return (
    <div className="p-8 border-b border-gray-100">
      <h3 className="text-lg font-bold text-black mb-4">Skills Required</h3>

      <div className="flex flex-wrap gap-2">
        {job.requiredSkills.map((rs: any) => (
          <span
            key={rs.id}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium"
          >
            {rs.skill.name}
          </span>
        ))}
      </div>
    </div>
  );
}
