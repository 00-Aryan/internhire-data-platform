'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setReferrerAction } from '@/app/(main)/candidate/subscription/actions/setReferrer.action';
import { removeReferrerAction } from '@/app/(main)/candidate/subscription/actions/removeReferrer.action';

import { useNotification } from '@/shared/notifications/useNotification';
import { shareReferralContent } from '../utils/referralShare';

interface ReferralSectionProps {
  referral: {
    code: string | null;
    isLocked?: boolean; // optional, future-safe
    referrerCode?: string | null;
  };
}

export default function ReferralSection({ referral }: ReferralSectionProps) {
  const { showCustomSuccess } = useNotification();
  const router = useRouter();


  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(referral.isLocked ?? false);
  const [appliedCode, setAppliedCode] = useState<string | null>(referral.referrerCode ?? null);

  const handleApplyReferrer = async () => {
    if (!input.trim()) return;

    setIsSubmitting(true);

    const res = await setReferrerAction(input);

    setIsSubmitting(false);

    if (res.ok) {
      showCustomSuccess(
        'Referral Applied',
        'Referral code successfully linked to your account.'
      );
      setAppliedCode(input);
      setInput('');
      router.refresh();
      return;
    }

    const errorMap: Record<string, string> = {
      INVALID_CODE: 'Invalid referral code',
      SELF_REFERRAL: 'You cannot refer yourself',
      LOCKED: 'Referral is already locked',
      CIRCULAR: 'Circular referral detected',
      DEPTH_EXCEEDED: 'Referral depth limit exceeded',
      FAILED: 'Something went wrong',
    };

   const errorMessage =
      (res as any).message || errorMap[res.reason] || 'Unable to apply referral code. Please try again.';

showCustomSuccess('Referral Failed', errorMessage);


  };

  const handleCopy = async () => {
    if (!referral.code) return;

    const referralLink = `${window.location.origin}/auth/signup?ref=${referral.code}`;

    try {
      await navigator.clipboard.writeText(referralLink);
      showCustomSuccess('Copied!', 'Referral link copied to clipboard');
    } catch {
      showCustomSuccess('Copy failed', 'Please copy the code manually');
    }
  };

  const handleShare = async () => {
    if (!referral.code) return;

    await shareReferralContent(referral.code);
  };

  const handleReset = async () => {
    if (isLocked || isSubmitting) return;
    setIsSubmitting(true);

    const res = await removeReferrerAction();

    setIsSubmitting(false);

    if (res.ok) {
      setAppliedCode(null);
      setInput('');
      showCustomSuccess('Referral Removed', 'Referral code has been removed.');
      router.refresh();
    } else {
      showCustomSuccess('Remove Failed', 'Could not remove referrer.');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium text-gray-900">
            Your referral code:{' '}
            <span className="font-semibold">{referral.code ?? '—'}</span>
          </h3>

          <p className="text-sm text-gray-600 mt-2">
            Earn rewards when someone subscribes using your referral.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={!referral.code}
            className="text-sm px-4 py-1.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60"
          >
            Copy link
          </button>

          <button
            onClick={handleShare}
            disabled={!referral.code}
            className="text-sm px-4 py-1.5 rounded-full border border-gray-900 text-gray-900 hover:bg-gray-100 disabled:opacity-60"
          >
            Share
          </button>
        </div>
      </div>

      {!isLocked && !appliedCode && (
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="Enter referral code"
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            disabled={isSubmitting}
          />

          <button
            onClick={handleApplyReferrer}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Applying…' : 'Apply'}
          </button>
        </div>
      )}

      {appliedCode && (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
          <div className="text-sm text-gray-700">
            Applied: <span className="font-semibold text-gray-900">{appliedCode}</span>
          </div>
          {!isLocked && (
            <button
              onClick={handleReset}
              disabled={isSubmitting}
              className="text-xs font-medium text-gray-600 hover:text-gray-900 underline disabled:opacity-50"
            >
              {isSubmitting ? 'Resetting...' : 'Reset'}
            </button>
          )}
        </div>
      )}

      {isLocked && (
        <div className="text-sm text-gray-600">
          Referral is locked once subscription flow starts.
        </div>
      )}
    </div>
  );
}
