import { getSessionUser } from '@/core/auth/authUtils';
import { prisma } from '@/infra/db/prisma.client';
import { canCandidateTakeAssessments } from '@/core/subscription/subscriptionUtils.legacy';
import { redirect } from 'next/navigation';
import AssessmentList from '@/features/candidates/assessment/components/AssessmentList';

export default async function AssessmentPage() {
  const user = await getSessionUser();

  if (!user || !user.candidateProfile) {
    redirect('/auth/login');
  }

  // Check Subscription
  const hasAccess = canCandidateTakeAssessments(
    user.candidateProfile.assessmentsSubscriptionExpiry,
    user.email
  );

  // Fetch Available Assessments (Subdomains)
  // Check if there are any assessments to display empty state if needed
  const assessmentCount = await prisma.subdomain.count();

  if (assessmentCount === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">No assessments are currently available.</p>
      </div>
    );
  }

  return <AssessmentList hasAccess={hasAccess} />;
}
