/**
 * Wallet Repository
 * 
 * Handles all database operations for wallets and transactions
 * Implements IWalletRepository interface from walletService
 * 
 * Schema assumptions (CURRENT - TEMPORARY):
 * - Wallet.candidateId is unique
 * - WalletTransaction stores subscriptionId and level in metadata JSON
 * 
 * ⚠️ CRITICAL SCHEMA CORRECTION REQUIRED:
 * True idempotency enforcement requires promoting these to first-class columns:
 * 
 * WalletTransaction {
 *   id
 *   walletId
 *   candidateId
 *   type
 *   status
 *   amount
 *   description
 *   subscriptionId   String?  @index  // PROMOTED from metadata
 *   rewardLevel      Int?              // PROMOTED from metadata (1 | 2)
 *   metadata         Json?
 *   createdAt
 *   updatedAt
 * 
 *   @@unique([candidateId, subscriptionId, rewardLevel])
 * }
 * 
 * This guarantees:
 * - No duplicate rewards (DB-enforced)
 * - Idempotent cron jobs
 * - No race conditions
 * - Tractable refunds/reversals
 */

import { prisma } from '@/infra/db/prisma.client';
import {
  IWalletRepository,
  WalletDTO,
  WalletTransactionDTO,
  TransactionType,
  TransactionStatus,
} from './walletService';

export class WalletRepository implements IWalletRepository {
  private prisma = prisma;

  /**
   * Find wallet by candidate ID
   */
  async findByCandidateId(candidateId: string): Promise<WalletDTO | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { candidateId },
    });

    return wallet ? this.toWalletDTO(wallet) : null;
  }

  /**
   * Create a new wallet
   */
  async create(candidateId: string): Promise<WalletDTO> {
    const wallet = await this.prisma.wallet.create({
      data: {
        candidateId,
        balance: 0, // Initial cached balance (updated by cron when crediting)
      },
    });

    return this.toWalletDTO(wallet);
  }

  /**
   * Create a new wallet transaction
   */
  async createTransaction(data: {
    walletId: string;
    candidateId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<WalletTransactionDTO> {
    const transaction = await this.prisma.walletTransaction.create({
      data: {
        walletId: data.walletId,
        candidateId: data.candidateId,
        type: data.type,
        status: data.status,
        amount: data.amount,
        description: data.description,
        metadata: data.metadata ?? undefined,

      },
    });

    return this.toTransactionDTO(transaction);
  }

  /**
   * Find pending transactions
   * Used by cron jobs to process rewards
   */
  async findPendingTransactions(limit?: number): Promise<WalletTransactionDTO[]> {
    const transactions = await this.prisma.walletTransaction.findMany({
      where: {
        status: TransactionStatus.PENDING,
      },
      orderBy: {
        createdAt: 'asc', // Process oldest first (FIFO)
      },
      take: limit,
    });

    return transactions.map(this.toTransactionDTO);
  }

  /**
   * Update transaction status
   * Used to credit/cancel pending rewards
   */
  async updateTransactionStatus(
    id: string,
    status: TransactionStatus
  ): Promise<WalletTransactionDTO> {
    const transaction = await this.prisma.walletTransaction.update({
      where: { id },
      data: { status },
    });

    return this.toTransactionDTO(transaction);
  }

  /**
   * Get transactions for a candidate with optional filters
   */
  async getTransactionsByCandidate(
    candidateId: string,
    filters?: { status?: TransactionStatus; type?: TransactionType }
  ): Promise<WalletTransactionDTO[]> {
    const transactions = await this.prisma.walletTransaction.findMany({
      where: {
        candidateId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.type && { type: filters.type }),
      },
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
    });

    return transactions.map(this.toTransactionDTO);
  }

  /**
   * Calculate balance from ledger
   * Only CREDITED transactions count toward balance
   * This is the source of truth for wallet balance
   */
  async calculateBalance(candidateId: string): Promise<number> {
    const result = await this.prisma.walletTransaction.aggregate({
      where: {
        candidateId,
        status: TransactionStatus.CREDITED,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ?? 0;
  }

  /**
   * Find existing reward for idempotency check
   * Prevents duplicate rewards for the same subscription
   * 
   * ⚠️ TEMPORARY IMPLEMENTATION:
   * This uses JSON metadata querying which is fragile and cannot enforce
   * true DB-level uniqueness. True idempotency will be enforced once
   * subscriptionId and rewardLevel are promoted to first-class columns
   * with a unique constraint: @@unique([candidateId, subscriptionId, rewardLevel])
   * 
   * Current approach:
   * - Query by candidateId + type + metadata.subscriptionId
   * - Filter by metadata.level in-memory (Prisma JSON limitation)
   * 
   * Future approach (after schema migration):
   * - Single indexed query on (candidateId, subscriptionId, rewardLevel)
   * - DB-enforced uniqueness prevents race conditions
   */
  async findRewardBySubscription(
    candidateId: string,
    subscriptionId: string,
    level: number
  ): Promise<WalletTransactionDTO | null> {
    // Query by metadata path (JSON query)
    const transaction = await this.prisma.walletTransaction.findFirst({
      where: {
        candidateId,
        type: TransactionType.REFERRAL_REWARD,
        metadata: {
          path: ['subscriptionId'],
          equals: subscriptionId,
        },
      },
    });

    if (!transaction) {
      return null;
    }

    // Verify level matches (in-memory check due to Prisma JSON limitations)
    const metadata = transaction.metadata as Record<string, any> | null;
    if (metadata?.level !== level) {
      return null;
    }

    return this.toTransactionDTO(transaction);
  }

  /**
   * Convert Prisma Wallet model to DTO
   */
  private toWalletDTO(wallet: any): WalletDTO {
    return {
      id: wallet.id,
      candidateId: wallet.candidateId,
      balance: wallet.balance,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  /**
   * Convert Prisma WalletTransaction model to DTO
   */
  private toTransactionDTO(transaction: any): WalletTransactionDTO {
    return {
      id: transaction.id,
      walletId: transaction.walletId,
      candidateId: transaction.candidateId,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount,
      description: transaction.description,
      metadata: transaction.metadata,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}