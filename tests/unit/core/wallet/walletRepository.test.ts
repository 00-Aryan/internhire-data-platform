import { WalletRepository } from '@/core/wallet/walletRepository';
import { prisma } from '@/infra/db/prisma.client';
import { TransactionStatus, TransactionType } from '@/core/wallet/walletService';

describe('WalletRepository (Integration)', () => {
  const repo = new WalletRepository();
  let testCandidateId: string;
  let testUserId: string;

  // 1. Setup: Create a real user in the DB for testing
  beforeAll(async () => {
    const timestamp = Date.now();
    const user = await prisma.user.create({
      data: {
        email: `wallet_test_${timestamp}@example.com`,
        password: 'hash',
        phone: `555${timestamp.toString().slice(-7)}`,
        name: 'Wallet Test User',
        candidateProfile: {
          create: { city: 'Test City' }
        }
      },
      include: { candidateProfile: true }
    });
    testUserId = user.id;
    testCandidateId = user.candidateProfile!.id;
  });

  // 2. Cleanup: Delete the test user and their data
  afterAll(async () => {
    if (testCandidateId) {
      await prisma.walletTransaction.deleteMany({ where: { candidateId: testCandidateId } });
      await prisma.wallet.deleteMany({ where: { candidateId: testCandidateId } });
      await prisma.candidateProfile.delete({ where: { id: testCandidateId } });
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
    await prisma.$disconnect();
  });

  // Ensure isolation between tests by clearing transactions
  beforeEach(async () => {
    await prisma.walletTransaction.deleteMany({ where: { candidateId: testCandidateId } });
    await prisma.wallet.deleteMany({ where: { candidateId: testCandidateId } });
  });

  it('should create a wallet', async () => {
    const wallet = await repo.create(testCandidateId);
    expect(wallet.candidateId).toBe(testCandidateId);
    expect(wallet.balance).toBe(0);
  });

  it('should create a transaction', async () => {
    const wallet = await repo.create(testCandidateId);
    const tx = await repo.createTransaction({
      walletId: wallet.id,
      candidateId: testCandidateId,
      type: TransactionType.REFERRAL_REWARD,
      status: TransactionStatus.PENDING,
      amount: 100,
      description: 'Test Reward',
      metadata: { level: 1 }
    });

    expect(tx.id).toBeDefined();
    expect(tx.amount).toBe(100);
    expect(tx.status).toBe(TransactionStatus.PENDING);
  });

  it('should calculate balance correctly (only CREDITED)', async () => {
    const wallet = await repo.create(testCandidateId);
    
    // 1. Credited (should count)
    await repo.createTransaction({
      walletId: wallet.id,
      candidateId: testCandidateId,
      type: TransactionType.REFERRAL_REWARD,
      status: TransactionStatus.CREDITED,
      amount: 50,
      description: 'Credited 1'
    });

    // 2. Pending (should NOT count)
    await repo.createTransaction({
      walletId: wallet.id,
      candidateId: testCandidateId,
      type: TransactionType.REFERRAL_REWARD,
      status: TransactionStatus.PENDING,
      amount: 100,
      description: 'Pending 1'
    });

    // 3. Credited (should count)
    await repo.createTransaction({
      walletId: wallet.id,
      candidateId: testCandidateId,
      type: TransactionType.ADJUSTMENT,
      status: TransactionStatus.CREDITED,
      amount: 20,
      description: 'Credited 2'
    });

    const balance = await repo.calculateBalance(testCandidateId);
    expect(balance).toBe(70); // 50 + 20
  });

  it('should find reward by subscription (idempotency)', async () => {
    const wallet = await repo.create(testCandidateId);
    const subId = 'sub_123';
    
    // Create transaction with metadata
    await repo.createTransaction({
      walletId: wallet.id,
      candidateId: testCandidateId,
      type: TransactionType.REFERRAL_REWARD,
      status: TransactionStatus.PENDING,
      amount: 50,
      description: 'Reward',
      metadata: { subscriptionId: subId, level: 1 }
    });

    // Should find it
    const found = await repo.findRewardBySubscription(testCandidateId, subId, 1);
    expect(found).not.toBeNull();
    expect(found?.amount).toBe(50);

    // Should NOT find if level differs
    const notFound = await repo.findRewardBySubscription(testCandidateId, subId, 2);
    expect(notFound).toBeNull();
  });
});
