'use client';

import { checkCapability } from './readiness.service';
import type { Capability, UserProfileData } from './types';
import { useNotification } from '@/shared/notifications/useNotification';

interface UseRecruiterPublishGuardOptions {
  profile: UserProfileData | null;
  capability: Capability;
  onPublish: () => Promise<void>;
  onDraft: () => Promise<void>;
}

export function useRecruiterPublishGuard({
  profile,
  capability,
  onPublish,
  onDraft,
}: UseRecruiterPublishGuardOptions) {
  const { showConfirmation, showCustomSuccess } = useNotification();

  const canPublish = Boolean(profile);

  /* ------------------------------------------------------------------ */
  /* PUBLISH HANDLER                                                     */
  /* ------------------------------------------------------------------ */

  async function handlePublish() {
    if (!profile) {
      showCustomSuccess(
        'Profile Incomplete',
        'Recruiter profile not found. Please complete your profile first.'
      );
      return;
    }

    const readiness = await checkCapability({
      user: profile,
      capability,
    });

    if (!readiness.allowed) {
      const missingText =
        readiness.missing && readiness.missing.length > 0
          ? `\n\n${readiness.missing.map((m) => `• ${m}`).join('\n')}`
          : '';

      showCustomSuccess(
        'Profile Incomplete',
        `You can still create drafts, but publishing requires completing your professional and organization details.${missingText}`
      );
      return;
    }

    showConfirmation(
      'Publish Job',
      'Are you sure you want to publish this job live?',
      async () => {
        await onPublish();
      }
    );
  }

  /* ------------------------------------------------------------------ */
  /* DRAFT HANDLER                                                       */
  /* ------------------------------------------------------------------ */

  async function handleDraft() {
    showConfirmation(
      'Save Draft',
      'Save this job as a draft? You can edit and publish it later.',
      async () => {
        await onDraft();
      }
    );
  }

  return {
    handlePublish,
    handleDraft,
    canPublish,
  };
}
