import { redirect } from 'next/navigation';

/**
 * LEGACY ROUTE - Redirects to new job-scoped applications flow
 * Old talent pool concept replaced with job-scoped applications
 * Users must select a job first via /recruiter/jobs/[jobId]/applications
 */
export default function LegacyTalentPoolPage() {
  redirect('/recruiter/jobs');
}