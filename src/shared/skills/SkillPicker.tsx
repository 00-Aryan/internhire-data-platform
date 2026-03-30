'use client';

import SkillSearchInput, { Skill } from './SkillSearchInput';
import SkillChipList from './SkillChipList';

interface SkillPickerProps {
  selectedSkills: Skill[];
  onAdd(skill: Skill): void;
  onRemove(skillId: string): void;
}

export default function SkillPicker({
  selectedSkills,
  onAdd,
  onRemove,
}: SkillPickerProps) {
  return (
    <section className="bg-white space-y-4">
      <h2 className="text-lg font-semibold">Skills</h2>

      <SkillSearchInput
        onSelect={onAdd}
        disabledSkillIds={selectedSkills.map((s) => s.id)}
      />

      <SkillChipList
        skills={selectedSkills}
        onRemove={onRemove}
      />
    </section>
  );
}
