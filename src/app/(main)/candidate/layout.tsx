import CandidateSidebar from '@/features/candidates/layout/CandidateSidebar';
import { getSessionUser } from '@/core/auth/authUtils';
import { redirect } from 'next/navigation';

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user || !user.candidateProfile) {
    redirect('/auth/login');
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Sidebar (fixed, non-scrollable) */}
      <div className="hidden md:block">
        <CandidateSidebar />
      </div>

      {/* Scrollable content area */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12 bg-white">
        {children}
      </main>
    </div>
  );
}
