'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoginModal from '@/features/auth/components/modals/LoginModal';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const role =
    searchParams.get('role')?.toLowerCase() === 'recruiter'
      ? 'recruiter'
      : 'candidate';

  return (
    <LoginModal
      role={role}
      onClose={() => router.replace('/')}
      onSignup={() => router.replace(`/auth/signup?role=${role}`)}
      onForgotPassword={() =>
        router.replace(`/auth/forgot-password?role=${role}`)
      }
      onSuccessRedirect={(url) => router.replace(url)}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
