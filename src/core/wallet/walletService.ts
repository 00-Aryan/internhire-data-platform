/**
 * Wallet Service
 * 
 * Business rules enforced:
 * - Wallet is store credit (not for subscription payments)
 * - Rewards are created as PENDING, credited later by jobs
 * - All transactions are logged in ledger (audit trail)
 * - Balance is derived from ledger transactions
 */

export interface WalletDTO {
  id: string;
  candidateId: string;
  balance: number; // Cached snapshot; source of truth is ledger (WalletTransaction)
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransactionDTO {
  id: string;
  walletId: string;
  candidateId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description: string;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionType {
  REFERRAL_REWARD = 'REFERRAL_REWARD',
  WITHDRAWAL = 'WITHDRAWAL',
  ADJUSTMENT = 'ADJUSTMENT', // Manual adjustments by admin
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CREDITED = 'CREDITED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface CreateRewardInput {
  candidateId: string;
  amount: number;
  level: number; // 1 or 2
  subscriberCandidateId: string; // Who subscribed (triggered the reward)
  subscriptionId: string; // Which subscription triggered it
}

export interface IWalletRepository {
  findByCandidateId(candidateId: string): Promise<WalletDTO | null>;
  create(candidateId: string): Promise<WalletDTO>;
  
  // Transaction operations
  createTransaction(data: {
    walletId: string;
    candidateId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<WalletTransactionDTO>;
  
  findPendingTransactions(limit?: number): Promise<WalletTransactionDTO[]>;
  updateTransactionStatus(id: string, status: TransactionStatus): Promise<WalletTransactionDTO>;
  
  getTransactionsByCandidate(
    candidateId: string,
    filters?: { status?: TransactionStatus; type?: TransactionType }
  ): Promise<WalletTransactionDTO[]>;
  
  // Balance calculation from ledger
  calculateBalance(candidateId: string): Promise<number>;
  
  // Idempotency check (to be implemented)
  findRewardBySubscription(
    candidateId: string,
    subscriptionId: string,
    level: number
  ): Promise<WalletTransactionDTO | null>;
}

export class WalletService {
  constructor(private walletRepo: IWalletRepository) {}

  /**
   * Get or create wallet for a candidate
   * Lazy creation: creates wallet on first access
   */
  async getOrCreateWallet(candidateId: string): Promise<WalletDTO> {
    let wallet = await this.walletRepo.findByCandidateId(candidateId);
    
    if (!wallet) {
      wallet = await this.walletRepo.create(candidateId);
    }

    return wallet;
  }

  /**
   * Get current wallet balance
   * Balance is calculated from CREDITED transactions only
   */
  async getBalance(candidateId: string): Promise<number> {
    return this.walletRepo.calculateBalance(candidateId);
  }

  /**
   * Create a PENDING referral reward
   * This is called when a subscription is activated
   * Actual credit happens later via cron job
   * 
   * IMPORTANT: Idempotency protection
   * One subscription should generate rewards only once
   * This method must check for existing rewards before creating new ones
   * 
   * @param input - Reward details including level and subscription info
   * @returns Created transaction record
   */
  async createPendingReward(input: CreateRewardInput): Promise<WalletTransactionDTO> {
    const { candidateId, amount, level, subscriberCandidateId, subscriptionId } = input;

    // TODO: Implement idempotency check
    // Before creating, ensure no existing transaction for (candidateId + subscriptionId + level)
    // This prevents duplicate rewards if subscription service retries or has a race condition
    const existingReward = await this.walletRepo.findRewardBySubscription(
      candidateId,
      subscriptionId,
      level
    );

    if (existingReward) {
      // Reward already exists, return it (idempotent)
      return existingReward;
    }

    // Ensure wallet exists
    const wallet = await this.getOrCreateWallet(candidateId);

    // Validate amount
    if (amount <= 0) {
      throw new Error('Reward amount must be positive');
    }

    // Validate level
    if (level !== 1 && level !== 2) {
      throw new Error('Reward level must be 1 or 2');
    }

    // Create description
    const description = level === 1
      ? `Level 1 referral reward (₹${amount})`
      : `Level 2 referral reward (₹${amount})`;

    // Create PENDING transaction
    return this.walletRepo.createTransaction({
      walletId: wallet.id,
      candidateId,
      type: TransactionType.REFERRAL_REWARD,
      status: TransactionStatus.PENDING,
      amount,
      description,
      metadata: {
        level,
        subscriberCandidateId,
        subscriptionId,
      },
    });
  }

  /**
   * Credit a pending reward
   * Called by cron job to process pending rewards
   * 
   * @param transactionId - ID of the pending transaction
   * @returns Updated transaction
   */
  async creditPendingReward(transactionId: string): Promise<WalletTransactionDTO> {
    // Update transaction status to CREDITED
    // Note: Repository should validate current status is PENDING to prevent double crediting
    return this.walletRepo.updateTransactionStatus(transactionId, TransactionStatus.CREDITED);
  }

  /**
   * Get all pending rewards (for cron job processing)
   * 
   * @param limit - Optional limit for batch processing
   */
  async getPendingRewards(limit?: number): Promise<WalletTransactionDTO[]> {
    return this.walletRepo.findPendingTransactions(limit);
  }

  /**
   * Cancel a pending reward
   * Used if validation fails or subscription is refunded
   * 
   * @param transactionId - ID of the pending transaction
   */
  async cancelPendingReward(transactionId: string): Promise<WalletTransactionDTO> {
    return this.walletRepo.updateTransactionStatus(transactionId, TransactionStatus.CANCELLED);
  }

  /**
   * Get transaction history for a candidate
   * 
   * @param candidateId - Candidate ID
   * @param filters - Optional filters (status, type)
   */
  async getTransactionHistory(
    candidateId: string,
    filters?: { status?: TransactionStatus; type?: TransactionType }
  ): Promise<WalletTransactionDTO[]> {
    return this.walletRepo.getTransactionsByCandidate(candidateId, filters);
  }

  /**
   * Get wallet summary (balance + pending)
   * Useful for displaying wallet state to user
   */
  async getWalletSummary(candidateId: string): Promise<{
    balance: number;
    pending: number;
    totalEarned: number;
  }> {
    const [balance, transactions] = await Promise.all([
      this.getBalance(candidateId),
      this.getTransactionHistory(candidateId, { type: TransactionType.REFERRAL_REWARD }),
    ]);

    const pending = transactions
      .filter(t => t.status === TransactionStatus.PENDING)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalEarned = transactions
      .filter(t => t.status === TransactionStatus.CREDITED)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      balance,
      pending,
      totalEarned,
    };
  }

  /**
   * Create manual adjustment (admin only)
   * For correcting errors or special cases
   * 
   * @param candidateId - Candidate ID
   * @param amount - Amount (positive or negative)
   * @param description - Reason for adjustment
   */
  async createAdjustment(
    candidateId: string,
    amount: number,
    description: string
  ): Promise<WalletTransactionDTO> {
    if (amount === 0) {
      throw new Error('Adjustment amount cannot be zero');
    }

    const wallet = await this.getOrCreateWallet(candidateId);

    // Adjustments are immediately CREDITED (not pending)
    return this.walletRepo.createTransaction({
      walletId: wallet.id,
      candidateId,
      type: TransactionType.ADJUSTMENT,
      status: TransactionStatus.CREDITED,
      amount,
      description,
      metadata: {
        adjustedAt: new Date().toISOString(),
      },
    });
  }
}