'use client';
import { useRouter } from 'next/navigation';
import SkillPicker from '@/shared/skills/SkillPicker';
import type { Skill } from '@/shared/skills/SkillSearchInput';

/* ---------- Types ---------- */
interface RecruiterSkillsSectionProps {
  jobId?: string; // optional
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

/* ---------- Component ---------- */
export default function RecruiterSkillsSection({
  jobId,
  skills,
  onChange,
}: RecruiterSkillsSectionProps) {
  const router = useRouter();

  const addSkill = async (skill: Skill): Promise<void> => {
    // CASE 1: Creating new job (no jobId) → Update local state
    if (!jobId) {
      const updatedSkills = [...skills, skill];
      onChange(updatedSkills);
      return;
    }

    // CASE 2: Editing existing job → Call API
    await fetch('/api/recruiter/job-skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        skillId: skill.id,
      }),
    });
    router.refresh();
  };

  const removeSkill = async (skillId: string): Promise<void> => {
    // CASE 1: Creating new job (no jobId) → Update local state
    if (!jobId) {
      const updatedSkills = skills.filter((s) => s.id !== skillId);
      onChange(updatedSkills);
      return;
    }

    // CASE 2: Editing existing job → Call API
    await fetch(`/api/recruiter/job-skills?id=${skillId}`, {
      method: 'DELETE',
    });
    router.refresh();
  };

  return (
    <SkillPicker
      selectedSkills={skills}
      onAdd={addSkill}
      onRemove={removeSkill}
    />
  );
}