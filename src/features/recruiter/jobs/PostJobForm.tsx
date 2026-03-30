'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { RecruiterProfile } from './types';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { WorkDetailsSection } from './sections/WorkDetailsSection';
import { LocationSection } from './sections/LocationSection';
import { TimelineSection } from './sections/TimelineSection';
import { CompensationSection } from './sections/CompensationSection';
import { SettingsSection } from './sections/SettingsSection';

import RecruiterSkillsSection from '@/features/recruiter/skills/RecruiterSkillsSection';
import Tooltip from '@/shared/components/Tooltip';
import { useNotification } from '@/shared/notifications/useNotification';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Skill {
  id: string;
  name: string;
  category?: string | null;
}

interface PublishReadiness {
  canPostJob: boolean;
  missing: string[];
}

interface PostJobFormProps {
  mode?: 'create' | 'draft';
  draftId?: string;
  initialDraft?: any;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PostJobForm({
  mode = 'create',
  draftId,
  initialDraft,
}: PostJobFormProps) {
  const router = useRouter();
  const { showConfirmation, showCustomSuccess, showError } = useNotification();

  const isDraftMode = mode === 'draft';

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [readiness, setReadiness] = useState<PublishReadiness | null>(null);
  const [isPaid, setIsPaid] = useState(initialDraft?.isPaid ?? true);
  const [skills, setSkills] = useState<Skill[]>(
    initialDraft?.requiredSkills?.map((rs: any) => rs.skill) ?? []
  );

  /* ---------------------------------------------------------------------- */
  /* Fetch Recruiter Profile                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    
    async function fetchProfile() {
      try {
        const res = await fetch('/api/recruiter/profile');
        if (!res.ok) return;

        const data = await res.json();
        setProfile(data.recruiterProfile ?? data);
        setReadiness({
          canPostJob: data.readiness?.canPostJob ?? false,
          missing: data.readiness?.missing ?? [],
        });
      } catch (err) {
        console.error(err);
      }
    }

    fetchProfile();
  }, []);


  /* ---------------------------------------------------------------------- */
/* Rehydrate skills when draft changes                                     */
/* ---------------------------------------------------------------------- */

useEffect(() => {
  if (initialDraft?.requiredSkills) {
    setSkills(
      initialDraft.requiredSkills.map((rs: any) => rs.skill)
    );
  }
}, [initialDraft]);

  /* ---------------------------------------------------------------------- */
  /* Validation (PUBLISH ONLY)                                               */
  /* ---------------------------------------------------------------------- */

  function validatePublishForm(formData: FormData) {
    const errors: string[] = [];

    if (!(formData.get('title') as string)?.trim()) {
      errors.push('Job title is required');
    }
    if (!(formData.get('description') as string)?.trim()) {
      errors.push('Job description is required');
    }
    if (!formData.get('deadline')) {
      errors.push('Application deadline is required');
    }
    if (skills.length === 0) {
      errors.push('At least one required skill must be added');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  function formatErrorMessage(errors: string[]) {
    return `Please fix the following issues:<br/><br/>${errors
      .map((e) => `• ${e}`)
      .join('<br/>')}`;
  }

  /* ---------------------------------------------------------------------- */
  /* Draft Save (POST / PATCH)                                               */
  /* ---------------------------------------------------------------------- */

  async function saveDraft(formData: FormData) {
    const title = (formData.get('title') as string)?.trim();
    if (!title) {
      showError('Validation Error', 'Job title is required to save a draft.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isDraftMode
        ? `/api/recruiter/drafts/jobs/${draftId}`
        : '/api/recruiter/drafts/jobs';

      const method = isDraftMode ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: formData.get('description') || null,
          type: formData.get('type') || null,
          workMode: formData.get('workMode') || null,
          domain: formData.get('domain') || null,
          locationCity: formData.get('locationCity') || null,
          locationDistrict: formData.get('locationDistrict') || null,
          locationState: formData.get('locationState') || null,
          deadline: formData.get('deadline') || null,
          startDate: formData.get('startDate') || null,
          endDate: formData.get('endDate') || null,
          officeDaysPerWeek: formData.get('officeDaysPerWeek')
            ? Number(formData.get('officeDaysPerWeek'))
            : null,
          isPaid,
          stipendAmount:
            isPaid && formData.get('stipendAmount')
              ? Number(formData.get('stipendAmount'))
              : null,
          stipendFrequency: isPaid ? formData.get('stipendFrequency') : null,
          hasCertificate: formData.get('hasCertificate') === 'true',
          customPhone: formData.get('customPhone') || null,
          customEmail: formData.get('customEmail') || null,
          requiredSkills: skills.map((s) => s.id),
        }),

      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      showCustomSuccess(
        'Draft Saved',
        'Your draft has been saved successfully.'
      );

      router.push('/recruiter/drafts');
      router.refresh();
    } catch (err) {
      console.error(err);
      showError('Error', 'Failed to save draft.');
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Publish Job                                                            */
  /* ---------------------------------------------------------------------- */

  async function publishJob(formData: FormData) {
    const validation = validatePublishForm(formData);
    if (!validation.isValid) {
      showError('Validation Error', formatErrorMessage(validation.errors));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/recruiter/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          type: formData.get('type'),
          workMode: formData.get('workMode'),
          domain: formData.get('domain'),
          locationCity: formData.get('locationCity'),
          locationDistrict: formData.get('locationDistrict'),
          locationState: formData.get('locationState'),
          deadline: formData.get('deadline'),
          startDate: formData.get('startDate'),
          endDate: formData.get('endDate'),
          officeDaysPerWeek: formData.get('officeDaysPerWeek')
            ? Number(formData.get('officeDaysPerWeek'))
            : null,
          isPaid,
          stipendAmount: isPaid ? formData.get('stipendAmount') : null,
          stipendFrequency: isPaid ? formData.get('stipendFrequency') : null,
          hasCertificate: formData.get('hasCertificate') === 'true',
          customPhone: formData.get('customPhone'),
          customEmail: formData.get('customEmail'),
          requiredSkills: skills.map((s) => s.id),
        }),
      });

      if (!res.ok) throw new Error();

      showCustomSuccess(
        'Job Published',
        'Your job is now live and visible to candidates!'
      );

      router.push('/recruiter/posted-jobs');
      router.refresh();
    } catch {
      showError('Error', 'Failed to publish job.');
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* UI                                                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <form className="space-y-8">
      <BasicInfoSection initialJob={initialDraft} />
      <WorkDetailsSection initialJob={initialDraft} />
      <LocationSection initialJob={initialDraft} />
      <TimelineSection initialJob={initialDraft} />
      <CompensationSection
        isPaid={isPaid}
        setIsPaid={setIsPaid}
        initialJob={initialDraft}
      />
      <RecruiterSkillsSection skills={skills} onChange={setSkills} />
      <SettingsSection initialJob={initialDraft} />

      <div className="flex gap-4 pt-6">
        <button
          type="button"
          disabled={loading}
          onClick={(e) => {
            const form = e.currentTarget.form!;
            const fd = new FormData(form);
            showConfirmation(
              'Publish Job',
              readiness?.canPostJob
                ? 'Are you sure you want to publish this job live?'
                : `Your profile is incomplete.<br/><br/>${readiness?.missing
                  .map((m) => `• ${m}`)
                  .join('<br/>')}`,
              () => publishJob(fd)
            );
          }}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg"
        >
          Post Live Now
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={(e) => {
            const form = e.currentTarget.form!;
            const fd = new FormData(form);
            showConfirmation(
              'Save Draft',
              'Do you want to save this job as a draft?',
              () => saveDraft(fd)
            );
          }}
          className="flex-1 border py-3 rounded-lg"
        >
          Save Draft for Later
        </button>
      </div>
    </form>
  );
}
