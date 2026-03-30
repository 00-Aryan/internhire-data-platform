import { notFound } from 'next/navigation';
import { prisma } from '@/infra/db/prisma.client';
import { requireAuth } from '@/core/auth/guards';
import { SubscriptionReadService } from '@/core/subscription/subscriptionReadService';
import InternshipDetailsView from '@/features/jobs/internship-details/InternshipDetailsView';

interface PageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function InternshipDetailsPage({ params }: PageProps) {
  const { jobId } = await params;

  // 1. Auth guard — Candidate only
  const user = await requireAuth({ role: 'CANDIDATE' });

  if (!user.candidateProfile) {
    notFound();
  }

  const candidateProfile = user.candidateProfile;

  // 2. Fetch job details
  const job = await prisma.jobListing.findUnique({
    where: { id: jobId },
    include: {
      recruiter: {
        include: {
          user: true,
          establishment: true,
        },
      },
      requiredSkills: {
        include: {
          skill: true,
        },
      },
      applications: {
        where: {
          candidateId: candidateProfile.id,
        },
      },
    },
  });

  if (!job) {
    notFound();
  }

  // 3. Application state
  const hasApplied = job.applications.length > 0;
  const applicationStatus = hasApplied ? job.applications[0].status : null;

  // 4. Subscription check (Phase 4.1 source of truth)
  const subscriptionRead = new SubscriptionReadService();
  const activeSubscription =
    await subscriptionRead.getActiveCandidateSubscription(
      candidateProfile.id
    );

  const canApply = Boolean(activeSubscription);

  // 5. Delegate rendering
  return (
    <InternshipDetailsView
      job={job}
      candidateProfile={candidateProfile}
      hasApplied={hasApplied}
      applicationStatus={applicationStatus}
      canApply={canApply}
    />
  );
}
