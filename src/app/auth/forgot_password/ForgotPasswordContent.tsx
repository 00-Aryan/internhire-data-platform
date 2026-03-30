'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import ForgotPasswordModal from '@/features/auth/components/modals/ForgotPasswordModal';

export default function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const role =
    searchParams.get('role')?.toLowerCase() === 'recruiter'
      ? 'recruiter'
      : 'candidate';

  return (
    <ForgotPasswordModal
      role={role}
      onClose={() => router.replace('/')}
      onBackToLogin={() =>
        router.replace(`/auth/login?role=${role}`)
      }
    />
  );
}
