import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/core/auth/authUtils';
import LandingPage from '@/app/(main)/LandingPage';

export default async function HomePage() {
  const user = await getSessionUser();

  // Public user
  if (!user) {
    return <LandingPage />;
  }

  const cookieStore = await cookies();
  const activeRole = cookieStore.get('auth_role')?.value;

  // Route strictly by ACTIVE role
  if (activeRole === 'CANDIDATE' && user.candidateProfile) {
    redirect('/candidate');
  }

  if (activeRole === 'RECRUITER' && user.recruiterProfile) {
    redirect('/recruiter');
  }

  // Fallback: user exists but role is unclear
  // (do NOT auto-pick candidate)
  return <LandingPage />;
}
