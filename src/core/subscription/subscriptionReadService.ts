import { prisma } from '@/infra/db/prisma.client';

export class SubscriptionReadService {
  async getActiveCandidateSubscription(candidateId: string) {
    const now = new Date();

    return prisma.subscription.findFirst({
      where: {
        candidateId,
        status: 'ACTIVE',
        expiresAt: {
          gt: now,
        },
      },
    });
  }

  async isCandidateSubscriptionActive(candidateId: string): Promise<boolean> {
    const subscription = await this.getActiveCandidateSubscription(candidateId);
    return subscription !== null;
  }
}