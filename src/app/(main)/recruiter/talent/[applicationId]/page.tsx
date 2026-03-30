import { redirect } from 'next/navigation';

/**
 * LEGACY ROUTE - Redirects to new job-scoped applications flow
 * Old talent pool application detail replaced with job-scoped view
 * Users should access applications through /recruiter/jobs/[jobId]/applications
 */
interface Props {
  params: Promise<{ applicationId: string }>;
}

export default async function LegacyApplicationDetailPage({
  params,
}: Props) {
  const { applicationId } = await params;
  // Redirect to new job-scoped application detail
  redirect(`/recruiter/applications/${applicationId}`);
}