/**
 * Referral Repository
 * 
 * Handles all database operations for referrals
 * Implements IReferralRepository interface from referralService
 * 
 * Schema assumptions:
 * - Referral.candidateId is unique
 * - Referral.referralCode is unique
 * - These constraints will be enforced in Prisma schema
 */

import { prisma } from '@/infra/db/prisma.client';
import { IReferralRepository, ReferralDTO, ReferralChainItem } from './referralService';

export class ReferralRepository implements IReferralRepository {
  private prisma = prisma;

  /**
   * Find referral by candidate ID
   */
  async findByCandidateId(candidateId: string): Promise<ReferralDTO | null> {
    const referral = await this.prisma.referral.findUnique({
      where: { candidateId },
    });

    return referral ? this.toDTO(referral) : null;
  }

  /**
   * Find referral by referral code
   */
  async findByReferralCode(code: string): Promise<ReferralDTO | null> {
    const referral = await this.prisma.referral.findUnique({
      where: { referralCode: code },
    });

    return referral ? this.toDTO(referral) : null;
  }

  /**
   * Create a new referral record
   */
  async create(data: {
    candidateId: string;
    referralCode: string;
    referrerId?: string;
  }): Promise<ReferralDTO> {
    const referral = await this.prisma.referral.create({
      data: {
        candidateId: data.candidateId,
        referralCode: data.referralCode,
        referrerId: data.referrerId ?? null,
        isLocked: false,
      },
    });

    return this.toDTO(referral);
  }

  /**
   * Update referrer for a candidate
   */
  async updateReferrer(candidateId: string, referrerId: string): Promise<ReferralDTO> {
    const referral = await this.prisma.referral.update({
      where: { candidateId },
      data: { referrerId },
    });

    return this.toDTO(referral);
  }

  /**
   * Lock a referral (make referrer permanent)
   */
  async lockReferral(candidateId: string): Promise<ReferralDTO> {
    const referral = await this.prisma.referral.update({
      where: { candidateId },
      data: { isLocked: true },
    });

    return this.toDTO(referral);
  }

  /**
   * Get referral chain (upwards traversal)
   * 
   * Example:
   * C refers to B, B refers to A
   * getReferralChain(C, 2) returns:
   * [
   *   { candidateId: B, level: 1 }, // direct referrer
   *   { candidateId: A, level: 2 }  // indirect referrer
   * ]
   * 
   * Uses iterative approach to avoid recursion limits
   * 
   * Note: This implementation has N+1 queries (one per level + one for referral code)
   * This is acceptable because maxDepth is hard-limited to 2
   * Performance impact is negligible for small depth limits
   */
  async getReferralChain(candidateId: string, maxDepth: number): Promise<ReferralChainItem[]> {
    const chain: ReferralChainItem[] = [];
    let currentCandidateId: string | null = candidateId;
    let level = 0;

    while (currentCandidateId && level < maxDepth) {
      const referral: {
  candidateId: string;
  referrerId: string | null;
} | null = await this.prisma.referral.findUnique({
  where: { candidateId: currentCandidateId },
  select: {
    candidateId: true,
    referrerId: true,
  },
});


      if (!referral || !referral.referrerId) {
        // No more referrers in chain
        break;
      }

      level++;

      // Get the referrer's referral record to include their code
      const referrerReferral = await this.prisma.referral.findUnique({
        where: { candidateId: referral.referrerId },
      });

      if (!referrerReferral) {
        // Referrer doesn't have a referral record (shouldn't happen, but handle it)
        break;
      }

      chain.push({
        candidateId: referral.referrerId,
        referralCode: referrerReferral.referralCode,
        level,
      });

      // Move up the chain
      currentCandidateId = referral.referrerId;
    }

    return chain;
  }

  /**
   * Convert Prisma model to DTO
   */
  private toDTO(referral: any): ReferralDTO {
    return {
      id: referral.id,
      candidateId: referral.candidateId,
      referralCode: referral.referralCode,
      referrerId: referral.referrerId,
      isLocked: referral.isLocked,
      createdAt: referral.createdAt,
      updatedAt: referral.updatedAt,
    };
  }
}