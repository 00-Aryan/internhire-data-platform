'use client';

import { useState } from 'react';
import ActionButton from '@/shared/components/ActionButton';
import { useNotification } from '@/shared/notifications/useNotification';
import { mapApplicationError } from '../applicationErrorMapper';


interface Props {
  jobId: string;
  candidateId: string;
  initialHasApplied: boolean;
  jobTitle: string;
  companyName?: string;
  canApply: boolean;
}

export default function ApplyButton({
  jobId,
  candidateId, // intentionally unused (kept to avoid breaking callers)
  initialHasApplied,
  jobTitle,
  companyName,
  canApply,
}: Props) {
  const { showApplicationSuccess } = useNotification();
  const [hasApplied, setHasApplied] = useState(initialHasApplied);

  if (hasApplied) {
    return (
      <button
        disabled
        className="w-full bg-gray-100 text-gray-400 rounded-xl py-4 font-semibold cursor-not-allowed"
      >
        Already Applied
      </button>
    );
  }

  if (!canApply) {
    return (
      <ActionButton
        label="Subscription Required"
        confirmTitle="Subscription Required"
        confirmMessage="You need an active subscription to apply for this internship."
        onAction={async () => {
          window.location.href = '/candidate/subscription';
        }}

      />
    );
  }

  return (
    <ActionButton
      label="Apply Now"
      loadingLabel="Submitting..."
      confirmTitle="Confirm Application"
      confirmMessage={`Are you sure you want to apply for ${jobTitle}${companyName ? ` at ${companyName}` : ''
        }?`}
      onAction={async () => {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId }),
        });

        if (!res.ok) {
          let data: any = null;

          try {
            data = await res.json();
          } catch {
            data = {};
          }

          const { title, message, items } = mapApplicationError(data);

          const formattedMessage =
            Array.isArray(items) && items.length > 0
              ? `${message}<br /><br />${items
                .map(i => `• ${i}`)
                .join('<br />')}`
              : message;

          throw new Error(`${title}::${formattedMessage}`);

        }

        showApplicationSuccess({ jobTitle, companyName });
        setHasApplied(true);
      }}

    />
  );
}
