import CandidateProfileForm from '@/features/candidates/components/CandidateProfileForm';
import { getSessionUser } from '@/core/auth/authUtils';
import { redirect } from 'next/navigation';
import { prisma } from '@/infra/db/prisma.client';

export default async function EditCandidateProfilePage() {
  const user = await getSessionUser();

  if (!user || !user.candidateProfile) {
    redirect('/auth/login');
  }

  const completeProfile = await prisma.candidateProfile.findUnique({
    where: { id: user.candidateProfile.id },
    include: {
      tenthEducation: {
        include: {
          establishment: true,
        },
      },
      twelfthEducation: {
        include: {
          establishment: true,
        },
      },
      ugEducation: {
        include: {
          establishment: true,
        },
        orderBy: { completionYear: 'desc' },
      },
      pgEducation: {
        include: {
          establishment: true,
        },
        orderBy: { completionYear: 'desc' },
      },
      experience: {
        orderBy: { startDate: 'desc' },
      },
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });

  const userData = {
    ...user,
    candidateProfile: completeProfile,
  };

  return (
    <div className="w-full flex justify-center px-4 py-10 overflow-y-auto">
      <div className="w-full max-w-5xl">
        <CandidateProfileForm user={userData} />
      </div>
    </div>

  );
}
