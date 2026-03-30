import { SubscriptionService, PricingSource, SubscriptionStatus } from '@/core/subscription/subscriptionService';
import { ReferralService } from '@/core/referral/referralService';
import { WalletService, TransactionType, TransactionStatus } from '@/core/wallet/walletService';

// --- Mocks for Repositories ---
// We mock the repositories to simulate DB behavior in-memory

const mockSubscriptionRepo = {
  findFirstActiveByCandidate: jest.fn(),
  create: jest.fn(),
  activate: jest.fn(),
};

const mockReferralRepo = {
  findByCandidateId: jest.fn(),
  findByReferralCode: jest.fn(),
  create: jest.fn(),
  updateReferrer: jest.fn(),
  lockReferral: jest.fn(),
  getReferralChain: jest.fn(),
};

const mockWalletRepo = {
  findByCandidateId: jest.fn(),
  create: jest.fn(),
  createTransaction: jest.fn(),
  findPendingTransactions: jest.fn(),
  updateTransactionStatus: jest.fn(),
  getTransactionsByCandidate: jest.fn(),
  calculateBalance: jest.fn(),
  findRewardBySubscription: jest.fn(),
};

describe('Integration: Candidate Subscription Flow', () => {
  let subscriptionService: SubscriptionService;
  let referralService: ReferralService;
  let walletService: WalletService;

  // Test Data
  const candidateId = 'cand_1';
  const candidateEmail = 'candidate@example.com';
  const referrerId = 'ref_user_1';
  const referralCode = 'REF_USER';
  const subscriptionId = 'sub_123';

  beforeEach(() => {
    jest.clearAllMocks();

    // 1. Instantiate Services with Mock Repositories
    // This allows us to test the logic flow between services
    referralService = new ReferralService(mockReferralRepo as any);
    walletService = new WalletService(mockWalletRepo as any);
    subscriptionService = new SubscriptionService(
      mockSubscriptionRepo as any,
      referralService,
      walletService
    );
  });

  test('Full Flow: Create Pending -> Activate -> Lock Referral -> Distribute Rewards', async () => {
    // ======================================================
    // STEP 1: Create Pending Subscription (with Referral)
    // ======================================================
    
    // Setup: No active subscription exists
    mockSubscriptionRepo.findFirstActiveByCandidate.mockResolvedValue(null);
    
    // Setup: Repo returns the created subscription object
    mockSubscriptionRepo.create.mockResolvedValue({
      id: subscriptionId,
      candidateId,
      status: SubscriptionStatus.PENDING,
      pricePaid: 365, // Discounted price
      pricingSource: PricingSource.REFERRAL,
    });

    // Act
    const pendingSub = await subscriptionService.createPendingSubscription({
      candidateId,
      candidateEmail,
      referralCode,
    });

    // Assert Step 1
    expect(pendingSub.status).toBe(SubscriptionStatus.PENDING);
    expect(pendingSub.pricePaid).toBe(365);
    expect(mockSubscriptionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      candidateId,
      pricingSource: PricingSource.REFERRAL,
      status: SubscriptionStatus.PENDING,
    }));

    // ======================================================
    // STEP 2: Verify Payment & Activate Subscription
    // ======================================================
    
    // Setup: Activation returns the ACTIVE subscription
    const activeSubDTO = {
      ...pendingSub,
      status: SubscriptionStatus.ACTIVE,
      startedAt: new Date(),
    };
    mockSubscriptionRepo.activate.mockResolvedValue(activeSubDTO);

    // Setup: Referral Service needs to find the candidate's referral record to lock it
    mockReferralRepo.findByCandidateId.mockResolvedValue({
      id: 'ref_record_1',
      candidateId,
      isLocked: false, // Currently unlocked
    });

    // Setup: Referral Chain for rewards (Candidate -> Referrer)
    mockReferralRepo.getReferralChain.mockResolvedValue([
      { candidateId: referrerId, level: 1, referralCode: 'REF_USER' }
    ]);

    // Setup: Wallet Service needs to find referrer's wallet
    mockWalletRepo.findByCandidateId.mockResolvedValue({ id: 'wallet_ref_1' } as any);
    // Setup: No existing reward (idempotency check)
    mockWalletRepo.findRewardBySubscription.mockResolvedValue(null);
    // Setup: Transaction creation success
    mockWalletRepo.createTransaction.mockResolvedValue({ id: 'tx_reward_1' } as any);

    // Act
    const activeSub = await subscriptionService.activatePendingSubscription(subscriptionId);

    // Assert Step 2: Subscription Active
    expect(activeSub.status).toBe(SubscriptionStatus.ACTIVE);
    expect(mockSubscriptionRepo.activate).toHaveBeenCalledWith(subscriptionId);

    // Assert Step 3: Referral Locked
    // The service should have called lockReferral on the repo
    expect(mockReferralRepo.lockReferral).toHaveBeenCalledWith(candidateId);

    // Assert Step 4: Wallet Reward Created
    // Verify reward for Level 1 referrer
    expect(mockWalletRepo.createTransaction).toHaveBeenCalledWith(expect.objectContaining({
      walletId: 'wallet_ref_1',
      candidateId: referrerId,
      type: TransactionType.REFERRAL_REWARD,
      status: TransactionStatus.PENDING,
      amount: 40, // Level 1 amount
      metadata: expect.objectContaining({
        level: 1,
        subscriberCandidateId: candidateId,
        subscriptionId: subscriptionId,
      }),
    }));

    // Verify NO Level 2 reward (since chain only had 1 item)
    expect(mockWalletRepo.createTransaction).toHaveBeenCalledTimes(1);
  });
});