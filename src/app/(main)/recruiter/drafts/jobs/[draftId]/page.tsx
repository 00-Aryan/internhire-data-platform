// src/app/(main)/recruiter/drafts/jobs/[draftId]/page.tsx

import RecruiterDraftEditPage from '@/features/recruiter/drafts/RecruiterDraftEditPage';

export default async function Page({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;

  return <RecruiterDraftEditPage draftId={draftId} />;
}
