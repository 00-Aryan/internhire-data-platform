'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostJobForm from '@/features/recruiter/jobs/PostJobForm';
import { useNotification } from '@/shared/notifications/useNotification';

interface Props {
  draftId: string;
}

export default function RecruiterDraftEditPage({ draftId }: Props) {
  const router = useRouter();
  const { showError } = useNotification();

  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await fetch(`/api/recruiter/drafts/jobs/${draftId}`);

        if (!res.ok) {
          showError('Error', 'Draft not found or access denied.');
          router.push('/recruiter/drafts/jobs');
          return;
        }

        const data = await res.json();
        setDraft(data.draft);
      } catch {
        showError('Error', 'Failed to load draft.');
        router.push('/recruiter/drafts/jobs');
      } finally {
        setLoading(false);
      }
    }

    loadDraft();
  }, [draftId]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading draft…</div>;
  }

  if (!draft) return null;

  return (
    <PostJobForm
      mode="draft"
      draftId={draft.id}
      initialDraft={draft}
    />
  );
}
