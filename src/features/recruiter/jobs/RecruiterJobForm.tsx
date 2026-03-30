/**
 * @deprecated
 * Used only for editing published jobs.
 * Draft creation/editing uses PostJobForm.
 */


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { RecruiterProfile, RecruiterJobFormProps } from './types';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { WorkDetailsSection } from './sections/WorkDetailsSection';
import { LocationSection } from './sections/LocationSection';
import { TimelineSection } from './sections/TimelineSection';
import { CompensationSection } from './sections/CompensationSection';
import { SettingsSection } from './sections/SettingsSection';
import RecruiterSkillsSection from '@/features/recruiter/skills/RecruiterSkillsSection';
import Tooltip from '@/shared/components/Tooltip';
import { useNotification } from '@/shared/notifications/useNotification';

interface PublishReadiness {
  canPostJob: boolean;
  missing: string[];
}

interface Skill {
  id: string;
  name: string;
  category?: string | null;
}

export default function RecruiterJobForm({
  initialJob,
  showHeader = true,
}: RecruiterJobFormProps) {
  const router = useRouter();
  const { showConfirmation, showCustomSuccess, showError } = useNotification();
  const isEditMode = !!initialJob;

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [readiness, setReadiness] = useState<PublishReadiness | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [isPaid, setIsPaid] = useState(initialJob?.isPaid ?? false);
  const [skills, setSkills] = useState<Skill[]>(() => {
    return initialJob?.requiredSkills?.map((rs: any) => rs.skill) || [];
  });
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/recruiter/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data.recruiterProfile ?? data);
          setReadiness({
            canPostJob: data.readiness?.canPostJob ?? false,
            missing: data.readiness?.missing ?? [],
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
      setFetchingProfile(false);
    };

    fetchProfile();
  }, []);

  /* ---------------- Validation ---------------- */

  function validateForm(formData: FormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const deadline = formData.get('deadline') as string;

    if (!title?.trim()) {
      errors.push('Job title is required');
    } else if (title.trim().length < 3) {
      errors.push('Job title must be at least 3 characters');
    }

    if (!description?.trim()) {
      errors.push('Job description is required');
    } else if (description.trim().length < 10) {
      errors.push('Job description must be at least 10 characters');
    }

    if (!deadline) {
      errors.push('Application deadline is required');
    } else {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        errors.push('Application deadline cannot be in the past');
      }
    }

    const stipendAmount = formData.get('stipendAmount') as string;
    if (isPaid && (!stipendAmount || parseInt(stipendAmount) <= 0)) {
      errors.push('Stipend amount is required for paid positions');
    }

    if (skills.length === 0) {
      errors.push('At least one required skill must be added');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /* ---------------- Format Errors for Display ---------------- */

  function formatErrorMessage(errors: string[]): string {
    return `Please fix the following issues:<br/><br/>${errors.map((e) => `• ${e}`).join('<br/>')}`;
  }

  /* ---------------- Button Click Handlers ---------------- */

  const handlePublishClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget.form;
    if (!form) return;
    
    const formData = new FormData(form);
    formData.set('status', 'OPEN');
    
    await handlePublishIntent(formData);
  };

  const handleDraftClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget.form;
    if (!form) return;
    
    const formData = new FormData(form);
    formData.set('status', 'DRAFT');
    
    await handleDraftIntent(formData);
  };

  /* ---------------- Form Submit Entry (Fallback) ---------------- */

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  /* ---------------- Publish Flow ---------------- */

  async function handlePublishIntent(formData: FormData) {
    // For editing existing drafts, check if we're publishing
    const isPublishing = isEditMode && initialJob?.status === 'DRAFT';

    showConfirmation(
      isPublishing ? 'Publish Job' : 'Update Job',
      isPublishing && !readiness?.canPostJob
        ? `Your profile is incomplete.<br/><br/>You can still save this job as a draft.<br/><br/>${readiness?.missing.map((m) => `• ${m}`).join('<br/>')}`
        : isPublishing
        ? 'Are you sure you want to publish this job live?'
        : 'Are you sure you want to update this job?',
      async () => {
        if (isPublishing && !readiness?.canPostJob) {
          formData.set('status', 'DRAFT');
        }
        await submitJob(formData);
      }
    );
  }

  /* ---------------- Draft Flow ---------------- */

  async function handleDraftIntent(formData: FormData) {
    showConfirmation(
      'Save Draft',
      'Save this job as a draft? You can edit and publish it later.',
      async () => {
        await submitJob(formData);
      }
    );
  }

  /* ---------------- Actual Submit ---------------- */

  async function submitJob(formData: FormData) {
    const validation = validateForm(formData);
    
    if (!validation.isValid) {
      showError(
        'Error',
        formatErrorMessage(validation.errors)
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
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
        status: formData.get('status'),
        requiredSkills: skills.map((s) => s.id),
      };

      const url = isEditMode ? `/api/recruiter/jobs/${initialJob.id}` : '/api/recruiter/jobs';
      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setLoading(false);

      if (!response.ok) {
        const err = await response.json();
        
        if (err.missing && Array.isArray(err.missing)) {
          showError(
            'Profile Incomplete',
            `Please complete your profile:<br/><br/>${err.missing.map((m: string) => `• ${m}`).join('<br/>')}`
          );
        } else {
          showError('Error', err.error || 'Failed to save job. Please try again.');
        }
        return;
      }

      const result = await response.json();
      const isDraft = formData.get('status') === 'DRAFT';
      
      showCustomSuccess(
        isEditMode
          ? isDraft ? 'Draft Updated' : 'Job Updated'
          : isDraft ? 'Draft Saved' : 'Job Published',
        isEditMode
          ? isDraft 
            ? 'Your draft has been updated successfully.'
            : 'Your job listing has been updated successfully!'
          : isDraft
          ? 'Your job has been saved as a draft. You can edit and publish it later.'
          : 'Your job is now live and visible to candidates!'
      );

      if (formData.get('status') === 'OPEN') {
        router.push('/recruiter/posted-jobs');
        router.refresh();
      } else {
        router.push(`/recruiter/jobs/${result.job?.id || initialJob?.id}`);
        router.refresh();
      }
    } catch (error) {
      setLoading(false);
      console.error('Job submission error:', error);
      showError('Error', 'Failed to save job. Please check your connection and try again.');
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {isEditMode && <input type="hidden" name="id" value={initialJob.id} />}

      <BasicInfoSection initialJob={initialJob} />
      <WorkDetailsSection initialJob={initialJob} />
      <LocationSection initialJob={initialJob} />

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Required Skills
        </h3>
        <RecruiterSkillsSection
          skills={skills}
          onChange={setSkills}
        />
      </div>

      <TimelineSection initialJob={initialJob} />
      <CompensationSection
        isPaid={isPaid}
        setIsPaid={setIsPaid}
        initialJob={initialJob}
      />
      <SettingsSection initialJob={initialJob} />

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t border-gray-200">
        {/* Show different buttons based on mode and status */}
        {!isEditMode || initialJob?.status === 'DRAFT' ? (
          <>
            <button
              type="button"
              disabled={loading}
              onClick={handlePublishClick}
              className="flex-1 bg-green-600 text-white rounded-lg py-3 px-6 font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              <Tooltip
                content={
                  readiness?.canPostJob
                    ? 'Publish this job live'
                    : 'Complete your profile to publish jobs'
                }
              >
                <span className="inline-block w-full text-center">
                  {loading ? 'Publishing...' : 'Post Live Now'}
                </span>
              </Tooltip>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleDraftClick}
              className="flex-1 border border-gray-300 bg-white text-gray-700 rounded-lg py-3 px-6 font-semibold hover:bg-gray-50 transition"
            >
              {loading ? 'Saving...' : isEditMode ? 'Save Draft' : 'Draft for Later'}
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handlePublishClick}
            className="flex-1 bg-blue-600 text-white rounded-lg py-3 px-6 font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Updating...' : 'Update Job Listing'}
          </button>
        )}

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}