'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SignupModal from '@/features/auth/components/modals/SignupModal';
import { useNotification } from '@/shared/notifications/useNotification';

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showCustomSuccess } = useNotification();

  const role =
    searchParams.get('role')?.toLowerCase() === 'recruiter'
      ? 'recruiter'
      : 'candidate';

  return (
    <SignupModal
      role={role}
      onClose={() => router.replace('/')}
      onLogin={() => router.replace(`/auth/login?role=${role}`)}
      onSuccess={(data) => {
        showCustomSuccess(
          'Account Created',
          data?.message || 'User created successfully. Please check your email to verify your account.',
          {},
          () => router.replace(`/auth/login?role=${role}`)
        );
      }}
    />
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}
