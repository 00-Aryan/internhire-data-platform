'use client';

import { useState } from 'react';
import { useNotification } from '@/shared/notifications/useNotification';

interface ActionButtonProps {
  label: string;
  loadingLabel?: string;
  confirmTitle: string;
  confirmMessage: string;
  onAction: () => Promise<void>;
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function ActionButton({
  label,
  loadingLabel = 'Processing...',
  confirmTitle,
  confirmMessage,
  onAction,
  onSuccess,
  disabled = false,
  className = '',
}: ActionButtonProps) {
  const { showConfirmation, showCustomSuccess } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    showConfirmation(confirmTitle, confirmMessage, async () => {
      setLoading(true);
      try {
        await onAction();
        onSuccess?.();
      } catch (err) {
        const rawMessage =
          err instanceof Error ? err.message : 'Something went wrong';

        const [title, message] = rawMessage.includes('::')
          ? rawMessage.split('::')
          : ['Action Failed', rawMessage];

        showCustomSuccess(title, message);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`w-full rounded-xl py-4 font-semibold transition
        bg-blue-600 hover:bg-blue-700 text-white
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}`}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
