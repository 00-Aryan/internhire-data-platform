'use client';

export interface SelectedSkill {
  id: string;
  name: string;
  category?: string | null;
}

interface SkillChipListProps {
  skills: SelectedSkill[];
  onRemove(skillId: string): void;
}

export default function SkillChipList({ skills, onRemove }: SkillChipListProps) {
  if (skills.length === 0) {
    return <p className="text-sm text-gray-600">No skills added yet</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <div
          key={skill.id}
          className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-white"
        >
          <span className="font-medium">{skill.name}</span>
          {skill.category && (
            <span className="text-xs text-gray-500">({skill.category})</span>
          )}
          <button
            onClick={() => onRemove(skill.id)}
            className="ml-1 text-gray-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
