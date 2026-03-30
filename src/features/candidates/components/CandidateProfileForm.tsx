'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

import PersonalInfoSection from './profile/PersonalInfoSection';
import LocationSection from './profile/LocationSection';
import SecuritySection from './profile/SecuritySection';

import TenthEducationSection from './education/TenthEducationSection';
import TwelfthEducationSection from './education/TwelfthEducationSection';
import UGEducationSection from './education/UGEducationSection';
import PGEducationSection from './education/PGEducationSection';
import ExperienceSection from './education/ExperienceSection';
import SkillsSection from './skills/CandidateSkillsSection';

export default function CandidateProfileForm({ user }: any) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch('/api/candidate/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          phone: formData.get('phone'),
          dob: formData.get('dob') || null,
          city: formData.get('city') || null,
          district: formData.get('district') || null,
          state: formData.get('state') || null,
          password: formData.get('password') || undefined,
        }),
      });

      res.ok
        ? toast.success('Profile updated successfully!')
        : toast.error('Failed to update profile');

      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const profile = user.candidateProfile;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-12">
      <form onSubmit={onSubmit} className="space-y-12">
      <PersonalInfoSection
        name={user.name}
        email={user.email}
        phone={user.phone}
        dob={profile?.dob || null}
      />

      <LocationSection
        city={profile?.city || null}
        district={profile?.district || null}
        state={profile?.state || null}
      />

      <SecuritySection />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-indigo-600 py-2.5 text-sm font-semibold text-white"
      >
        {isSubmitting ? 'Saving…' : 'Save Changes'}
      </button>
      </form>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-10">
        <h2 className="text-lg font-semibold text-black">Education</h2>

        <TenthEducationSection candidateId={profile?.id || ''} tenthEducation={profile?.tenthEducation} />
        <TwelfthEducationSection candidateId={profile?.id || ''} twelfthEducation={profile?.twelfthEducation} />
        <UGEducationSection candidateId={profile?.id || ''} ugEducation={profile?.ugEducation || []} />
        <PGEducationSection candidateId={profile?.id || ''} pgEducation={profile?.pgEducation || []} />
      </section>

      <ExperienceSection
        candidateId={profile?.id || ''}
        experience={profile?.experience || []}
      />

      <SkillsSection
        candidateId={profile?.id || ''}
        skills={profile?.skills || []}
      />
    </div>
  );
}
