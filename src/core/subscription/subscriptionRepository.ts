import { prisma } from '@/infra/db/prisma.client';
import {
  ISubscriptionRepository,
  SubscriptionDTO,
  PricingSource,
  SubscriptionStatus,
} from './subscriptionService';

export class SubscriptionRepository implements ISubscriptionRepository {
  private prisma = prisma;

  /**
   * Read-model: fetch ACTIVE + non-expired subscription
   * This is the ONLY method the system should use
   * to answer "does candidate have an active subscription?"
   */
  async findFirstActiveByCandidate(
    candidateId: string
  ): Promise<SubscriptionDTO | null> {
    const now = new Date();

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        candidateId,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: {
          gt: now,
        },
      },
    });

    return subscription ? this.toDTO(subscription) : null;
  }

  /**
   * Create subscription in PENDING state
   * No side effects here
   */
  async create(data: {
    candidateId: string;
    pricePaid: number;
    pricingSource: PricingSource;
    status: SubscriptionStatus;
    expiresAt: Date;
    appliedCouponCode?: string;
  }): Promise<SubscriptionDTO> {
    const subscription = await this.prisma.subscription.create({
      data: {
        candidateId: data.candidateId,
        pricePaid: data.pricePaid,
        pricingSource: data.pricingSource,
        status: data.status,
        expiresAt: data.expiresAt,
        startedAt: null,
        appliedCouponCode: data.appliedCouponCode,
      } as any,
    });

    return this.toDTO(subscription);
  }

  /**
   * Activate subscription — IDEMPOTENT
   *
   * Rules:
   * - PENDING → ACTIVE (normal)
   * - ACTIVE → return existing (idempotent)
   * - FAILED → throw (illegal state)
   */
  async activate(subscriptionId: string): Promise<SubscriptionDTO> {
    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Idempotent return
      if (subscription.status === SubscriptionStatus.ACTIVE) {
        return this.toDTO(subscription);
      }

      // Illegal transition
      if (subscription.status !== SubscriptionStatus.PENDING) {
        throw new Error(
          `Cannot activate subscription in status ${subscription.status}`
        );
      }

      const updated = await tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          startedAt: new Date(),
        },
      });

      return this.toDTO(updated);
    });
  }

  /**
   * Internal mapper — no logic here
   */
  private toDTO(subscription: any): SubscriptionDTO {
    return {
      id: subscription.id,
      candidateId: subscription.candidateId,
      pricePaid: subscription.pricePaid,
      pricingSource: subscription.pricingSource,
      status: subscription.status,
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
      appliedCouponCode: subscription.appliedCouponCode,
    };
  }
}
