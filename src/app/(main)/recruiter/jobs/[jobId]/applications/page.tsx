import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/core/auth/authUtils';
import { prisma } from '@/infra/db/prisma.client';
import { JobApplicationsList } from '@/features/recruiter/applications/JobApplicationsList';

interface Props {
  params: Promise<{ jobId: string }>;
}

export default async function JobApplicationsPage({ params }: Props) {
  const { jobId } = await params;

  // 1. AUTH CHECK: Recruiter must be logged in
  const user = await getSessionUser();
  if (!user?.recruiterProfile) {
    redirect('/auth/login');
  }

  // 2. OWNERSHIP CHECK: Fetch job and verify it belongs to this recruiter
  const job = await prisma.jobListing.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    return notFound();
  }

  if (job.recruiterId !== user.recruiterProfile.id) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600 p-10">
        <h1 className="text-4xl font-bold mb-4">403 Forbidden</h1>
        <p>You do not have permission to view applications for this job.</p>
      </div>
    );
  }

  // 3. RENDER: Pass job data to feature component (data fetching happens in client hook)
  return <JobApplicationsList jobId={jobId} jobTitle={job.title} />;
}
