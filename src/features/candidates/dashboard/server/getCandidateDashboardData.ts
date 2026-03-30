// src/features/candidates/dashboard/server/getCandidateDashboardData.ts
import { prisma } from '@/infra/db/prisma.client';

export async function getCandidateDashboardData(candidateId: string) {
  const ugEducation = await prisma.uGEducation.findFirst({
    where: { candidateId },
    include: { establishment: true },
    orderBy: { completionYear: 'desc' }
  });

  const pgEducation = !ugEducation
    ? await prisma.pGEducation.findFirst({
        where: { candidateId },
        include: { establishment: true },
        orderBy: { completionYear: 'desc' }
      })
    : null;

  return {
    education: ugEducation || pgEducation
  };
}
