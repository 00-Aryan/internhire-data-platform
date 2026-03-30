import { notFound, redirect } from 'next/navigation';
import RecruiterJobManagePage from '@/features/recruiter/jobs/manage/RecruiterJobManagePage';
import { getSessionUser } from '@/core/auth/authUtils';
import { prisma } from '@/infra/db/prisma.client';

interface Props {
  params: Promise<{ jobId: string }>;
}

export default async function JobDetailsPage({ params }: Props) {
  const { jobId } = await params;

  const currentUser = await getSessionUser();

  if (!currentUser?.recruiterProfile) {
    redirect('/auth/login');
  }

  const job = await prisma.jobListing.findUnique({
    where: { id: jobId },
    include: {
      requiredSkills: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!job) {
    return notFound();
  }

  if (job.recruiterId !== currentUser.recruiterProfile.id) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600">
        <h1 className="text-4xl font-bold mb-4">403 Forbidden</h1>
        <p>You do not have permission to manage this job listing.</p>
      </div>
    );
  }

  return <RecruiterJobManagePage initialJob={job} />;
}