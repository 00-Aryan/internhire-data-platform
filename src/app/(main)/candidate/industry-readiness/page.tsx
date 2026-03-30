




import { getSessionUser } from '@/core/auth/authUtils';
import { redirect } from 'next/navigation';
import IndustryReadinessClient from '@/features/candidates/components/IndustryReadinessView';
import { prisma } from '@/infra/db/prisma.client';

export default async function IndustryReadinessPage() {
  const user = await getSessionUser();
  if (!user || !user.candidateProfile) {
    redirect('/auth/login');
  }

  const candidateId = user.candidateProfile.id;

  // Fetch all scores
  const globalScore = await prisma.globalScore.findUnique({
    where: { candidateId }
  });

  const domainScores = await prisma.domainScore.findMany({
    where: { candidateId },
    include: { domain: true },
    orderBy: { domainScore: 'desc' }
  });

  const subdomainScores = await prisma.subdomainDerivedScore.findMany({
    where: { candidateId },
    include: { subdomain: true },
    orderBy: { subdomainScore: 'desc' }
  });  
 

  return (
    <IndustryReadinessClient 
      candidateId={candidateId}
      globalScore={globalScore}
      domainScores={domainScores}
      subdomainScores={subdomainScores}
    />
   
  );
}
