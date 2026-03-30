// business logic

/**
 * Referral Service
 * 
 * Business rules enforced:
 * - Every candidate has exactly one immutable referral code
 * - A candidate can have at most one referrer
 * - Referrer can be set at signup OR after login BUT before first successful subscription
 * - Referrer becomes locked after first ACTIVE subscription
 * - Anti-abuse: no self-referral, no circular referrals, max depth 2
 */

import { randomBytes } from 'crypto';

export interface ReferralDTO {
  id: string;
  candidateId: string;
  referralCode: string;
  referrerId: string | null;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralChainItem {
  candidateId: string;
  referralCode: string;
  level: number; // 1 = direct referrer, 2 = indirect
}

export interface IReferralRepository {
  findByCandidateId(candidateId: string): Promise<ReferralDTO | null>;
  findByReferralCode(code: string): Promise<ReferralDTO | null>;
  create(data: { candidateId: string; referralCode: string; referrerId?: string }): Promise<ReferralDTO>;
  updateReferrer(candidateId: string, referrerId: string | null): Promise<ReferralDTO>;
  lockReferral(candidateId: string): Promise<ReferralDTO>;
  getReferralChain(candidateId: string, maxDepth: number): Promise<ReferralChainItem[]>;
}

export class ReferralService {
  constructor(private referralRepo: IReferralRepository) {}

  /**
   * Generate a unique referral code
   * Format: 8 characters, alphanumeric uppercase
   */
  generateReferralCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * Get or create referral record for a candidate
   * Lazy generation: if not exists, creates one with unique code
   */
  async getOrCreateReferral(candidateId: string): Promise<ReferralDTO> {
    let referral = await this.referralRepo.findByCandidateId(candidateId);
    
    if (!referral) {
      // Generate unique code (retry if collision)
      let code = this.generateReferralCode();
      let attempts = 0;
      const MAX_ATTEMPTS = 10;

      while (attempts < MAX_ATTEMPTS) {
        const existing = await this.referralRepo.findByReferralCode(code);
        if (!existing) break;
        code = this.generateReferralCode();
        attempts++;
      }

      if (attempts === MAX_ATTEMPTS) {
        throw new Error('Failed to generate unique referral code');
      }

      referral = await this.referralRepo.create({
        candidateId,
        referralCode: code,
      });
    }

    return referral;
  }

  /**
   * Get referral by code (for lookups during signup/setting referrer)
   */
  async getReferralByCode(code: string): Promise<ReferralDTO | null> {
    return this.referralRepo.findByReferralCode(code.toUpperCase());
  }

  /**
   * Check if a candidate can still set/change their referrer
   * Returns true if:
   * - Referral is not locked
   * - No referrer is set OR referrer can still be changed
   */
  async canSetReferrer(candidateId: string): Promise<boolean> {
    const referral = await this.referralRepo.findByCandidateId(candidateId);
    
    if (!referral) {
      // No referral record yet, can set referrer
      return true;
    }

    // Cannot set if already locked
    return !referral.isLocked;
  }

  /**
   * Set referrer for a candidate
   * Validates all anti-abuse rules
   * 
   * @throws Error if validation fails
   */
  async setReferrer(candidateId: string, referrerCode: string): Promise<ReferralDTO> {
    // 1. Validate referrer exists
    const referrerReferral = await this.referralRepo.findByReferralCode(referrerCode.toUpperCase());
    if (!referrerReferral) {
      throw new Error('Invalid referral code');
    }

    const referrerId = referrerReferral.candidateId;

    // 2. No self-referral
    if (candidateId === referrerId) {
      throw new Error('Self-referral is not allowed');
    }

    // 3. Check if candidate can still set referrer
    const canSet = await this.canSetReferrer(candidateId);
    if (!canSet) {
      throw new Error('Referrer is already locked and cannot be changed');
    }

    // 4. Check for circular referrals (max depth 2)
    // Get the referrer's chain - if candidate is in it, it's circular
    const referrerChain = await this.referralRepo.getReferralChain(referrerId, 2);
    
    const isCircular = referrerChain.some(item => item.candidateId === candidateId);
    if (isCircular) {
      throw new Error('Circular referral detected');
    }

    // 5. Enforce max depth = 2
    // If referrer already has a depth of 2, adding this candidate would make depth 3
    if (referrerChain.length >= 2) {
      throw new Error('Maximum referral depth exceeded');
    }

    // 6. Get or create candidate's referral record
    const candidateReferral = await this.getOrCreateReferral(candidateId);

    // 7. Update referrer
    if (candidateReferral.referrerId === referrerId) {
      // Already set to this referrer, return as-is
      return candidateReferral;
    }

    return this.referralRepo.updateReferrer(candidateId, referrerId);
  }

  /**
   * Remove referrer for a candidate
   * Only allowed if not locked
   */
  async removeReferrer(candidateId: string): Promise<ReferralDTO> {
    const canSet = await this.canSetReferrer(candidateId);
    if (!canSet) {
      throw new Error('Referrer is already locked and cannot be changed');
    }

    await this.getOrCreateReferral(candidateId);
    return this.referralRepo.updateReferrer(candidateId, null);
  }

  /**
   * Lock referral after first ACTIVE subscription
   * This makes the referrer permanent and unchangeable
   */
  async lockReferral(candidateId: string): Promise<void> {
    const referral = await this.referralRepo.findByCandidateId(candidateId);
    
    if (!referral) {
      throw new Error('Referral record not found');
    }

    if (!referral.isLocked) {
      await this.referralRepo.lockReferral(candidateId);
    }
  }

  /**
   * Get referral chain for reward calculation
   * Returns up to 2 levels: direct referrer (L1) and indirect referrer (L2)
   * 
   * Used when a candidate subscribes to determine who gets rewards
   */
  async getReferralChainForRewards(candidateId: string): Promise<ReferralChainItem[]> {
    return this.referralRepo.getReferralChain(candidateId, 2);
  }

  /**
   * Get referrer info (direct only)
   */
  async getDirectReferrer(candidateId: string): Promise<string | null> {
    const referral = await this.referralRepo.findByCandidateId(candidateId);
    return referral?.referrerId ?? null;
  }

  /**
   * Check if referral is locked
   */
  async isReferralLocked(candidateId: string): Promise<boolean> {
    const referral = await this.referralRepo.findByCandidateId(candidateId);
    return referral?.isLocked ?? false;
  }
}