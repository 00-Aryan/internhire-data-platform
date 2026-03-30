import { redirect } from 'next/navigation';
import { getSessionUser } from '@/core/auth/authUtils';
import { prisma } from '@/infra/db/prisma.client';

import RecruiterAccountForm from '@/features/recruiter/profile/account/RecruiterAccountForm';
import RecruiterProfessionalForm from '@/features/recruiter/profile/professional/RecruiterProfessionalForm';
import CompanyProfileForm from '@/features/recruiter/profile/company/CompanyProfileForm';

export default async function RecruiterProfileEditPage() {
  const user = await getSessionUser();

  if (!user || !user.recruiterProfile) {
    redirect('/auth/login');
  }

  const recruiterProfile = await prisma.recruiterProfile.findUnique({
    where: { userId: user.id },
    include: {
      establishment: true,
    },
  });

  if (!recruiterProfile || !recruiterProfile.establishment) {
    redirect('/recruiter');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8">
      {/* Account */}
      <RecruiterAccountForm user={user} />

      {/* Professional */}
      <RecruiterProfessionalForm recruiterProfile={recruiterProfile} />

      {/* Company */}
      <CompanyProfileForm establishment={{
        ...recruiterProfile.establishment,
        name: recruiterProfile.establishment.name ?? ''
      }} />
    </div>
  );
}
