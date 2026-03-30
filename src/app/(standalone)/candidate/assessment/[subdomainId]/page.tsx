import AssessmentRunner from '@/features/candidates/assessment/components/AssessmentRunner';
import { prisma } from '@/infra/db/prisma.client';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    subdomainId: string;
  }>;
}

export default async function AssessmentRunnerPage({ params }: PageProps) {
  const { subdomainId } = await params;

  // Fetch subdomain name for the header
  const subdomain = await prisma.subdomain.findUnique({
    where: { id: subdomainId },
    select: { 
      name: true,
      domain: {
        select: { name: true }
      }
    }
  });

  if (!subdomain) {
    return notFound();
  }

  return <AssessmentRunner 
    subdomainId={subdomainId} 
    subdomainName={subdomain.name} 
    domainName={subdomain.domain?.name}
  />;
}
