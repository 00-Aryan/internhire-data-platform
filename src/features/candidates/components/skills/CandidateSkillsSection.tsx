'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import SkillPicker from '@/shared/skills/SkillPicker';
import type { Skill } from '@/shared/skills/SkillSearchInput';

/* ---------- Types ---------- */
interface CandidateSkill {
  id: string;          // CandidateSkill id
  skillId: string;     // Skill master id
  skill: Skill;
}

interface CandidateSkillsSectionProps {
  candidateId: string;
  skills: CandidateSkill[];
}

/* ---------- Component ---------- */
export default function CandidateSkillsSection({
  candidateId,
  skills,
}: CandidateSkillsSectionProps) {
  const router = useRouter();

  const addSkill = async (skill: Skill): Promise<void> => {
    try {
      const res = await fetch('/api/candidate/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          skillId: skill.id,
          name: skill.name,
          level: 'Beginner',
        }),
      });

      if (!res.ok) {
        toast.error('Failed to add skill');
        return;
      }

      toast.success(`Added ${skill.name}`);
      router.refresh();
    } catch {
      toast.error('Failed to add skill');
    }
  };

  const removeSkill = async (skillId: string): Promise<void> => {
    try {
      await fetch(`/api/candidate/skills?id=${skillId}`, {
        method: 'DELETE',
      });
      router.refresh();
    } catch {
      toast.error('Failed to remove skill');
    }
  };

  return (
    <SkillPicker
      selectedSkills={skills.map((s: CandidateSkill) => s.skill)}
      onAdd={addSkill}
      onRemove={removeSkill}
    />
  );
}
