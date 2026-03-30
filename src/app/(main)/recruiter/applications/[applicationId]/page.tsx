import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/core/auth/authUtils';
import { prisma } from '@/infra/db/prisma.client';
import ApplicationDetailView from '@/features/recruiter/applications/ApplicationDetailView';

interface Props {
  params: Promise<{ applicationId: string }>;
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { applicationId } = await params;

  // 1. AUTH CHECK: Recruiter must be logged in
  const user = await getSessionUser();
  if (!user?.recruiterProfile) {
    redirect('/auth/login');
  }

  // 2. FETCH APPLICATION: Get complete application data
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: true,
      candidate: {
        include: {
          user: true,
          tenthEducation: { include: { establishment: true } },
          twelfthEducation: { include: { establishment: true } },
          ugEducation: { include: { establishment: true } },
          pgEducation: { include: { establishment: true } },
          skills: { include: { skill: true } },
          experience: true,
          globalScore: true,
          domainScores: { include: { domain: true } },
          derivedScores: { include: { subdomain: { include: { domain: true } } } },
        },
      },
    },
  });

  // 3. SECURITY CHECK: Application must exist
  if (!application) {
    return notFound();
  }

  // 4. OWNERSHIP CHECK: Job must belong to logged-in recruiter
  if (application.job.recruiterId !== user.recruiterProfile.id) {
    return (
      <div className="p-10 text-center text-red-600">
        <h1 className="text-2xl font-bold">403 Forbidden</h1>
        <p>You do not have permission to view this applicant.</p>
      </div>
    );
  }

  return (
    <ApplicationDetailView
      application={application}
      jobId={application.jobId}
    />
  );
}
