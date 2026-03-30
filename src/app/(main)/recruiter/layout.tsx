import { getSessionUser } from '@/core/auth/authUtils';
import { redirect } from 'next/navigation';
import RecruiterSidebar from '@/features/recruiter/layout/RecruiterSidebar';
import { NotificationProvider } from '@/shared/notifications/NotificationProvider';
import SuccessModal from '@/shared/notifications/SuccessModal';

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || !user.recruiterProfile) {
    redirect('/auth/login');
  }

  return (
    <NotificationProvider>
      <div className="h-screen flex bg-white overflow-hidden">
        <RecruiterSidebar />
        <main className="flex-1 overflow-y-auto p-8 md:p-12 bg-white">
          {children}
        </main>
      </div>
      <SuccessModal />
    </NotificationProvider>
  );
}