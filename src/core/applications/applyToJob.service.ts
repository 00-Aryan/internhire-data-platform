import { prisma } from '@/infra/db/prisma.client';
import { emitApplicationCreated } from './application.events';
import { ApplicationError } from './application.errors';

interface ApplyToJobInput {
  jobId: string;
  candidateId: string;
}

export async function applyToJob({
  jobId,
  candidateId,
}: ApplyToJobInput) {
  const application = await prisma.$transaction(async (tx) => {
    // 1. Ensure job exists
    const job = await tx.jobListing.findUnique({
      where: { id: jobId },
      select: { id: true },
    });

    if (!job) {
      throw new ApplicationError('JOB_NOT_FOUND');
    }

    // 2. Prevent duplicate application
    const existing = await tx.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId,
        },
      },
    });

    if (existing) {
      throw new ApplicationError('ALREADY_APPLIED');
    }

    // 3. Create application
    return tx.application.create({
      data: {
        jobId,
        candidateId,
        status: 'APPLIED',
      },
    });
  });

  // 4. Emit domain event AFTER commit
  emitApplicationCreated({
    applicationId: application.id,
    jobId,
    candidateId,
    occurredAt: new Date(),
  });

  return application;
}
