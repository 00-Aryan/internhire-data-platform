import { SubscriptionService, PricingSource } from '@/core/subscription/subscriptionService';
import { SubscriptionRepository } from '@/core/subscription/subscriptionRepository';
import { ReferralService } from '@/core/referral/referralService';
import { WalletService } from '@/core/wallet/walletService';

// ------------------------------------------------------------------
// Mocks
// ------------------------------------------------------------------
// We mock the repositories and external services to isolate the SubscriptionService.
// CRITICAL: We do NOT mock the CouponResolver (or internal pricing logic) 
// because we want to verify the actual pricing calculations.
jest.mock('@/core/subscription/subscriptionRepository');
jest.mock('@/core/referral/referralService');
jest.mock('@/core/wallet/walletService');

describe('Subscription Pricing Flow (Backend/UI Boundary)', () => {
  let subscriptionService: SubscriptionService;
  let mockSubscriptionRepo: jest.Mocked<SubscriptionRepository>;
  let mockReferralService: jest.Mocked<ReferralService>;
  let mockWalletService: jest.Mocked<WalletService>;

  // Test Data
  const CANDIDATE_ID = 'candidate-123';
  const CANDIDATE_EMAIL = 'test@example.com';
  const REFERRAL_CODE = 'REF123';

  beforeEach(() => {
    jest.clearAllMocks();

    // 1. Setup Mocks
    mockSubscriptionRepo = new SubscriptionRepository() as jest.Mocked<SubscriptionRepository>;
    mockReferralService = new ReferralService({} as any) as jest.Mocked<ReferralService>;
    mockWalletService = new WalletService({} as any) as jest.Mocked<WalletService>;

    // Default behavior: No active subscription
    mockSubscriptionRepo.findFirstActiveByCandidate.mockResolvedValue(null);

    // Mock create to return a simulated DTO based on input
    mockSubscriptionRepo.create.mockImplementation(async (data: any) => ({
      id: 'sub-pending-123',
      candidateId: data.candidateId,
      pricePaid: data.pricePaid,
      pricingSource: data.pricingSource,
      status: data.status,
      startedAt: null,
      expiresAt: data.expiresAt,
    }));

    // 2. Instantiate Service (System Under Test)
    // We inject the mocks, but the internal CouponResolver/Pricing logic remains real
    subscriptionService = new SubscriptionService(
      mockSubscriptionRepo,
      mockReferralService,
      mockWalletService
    );
  });

  // ------------------------------------------------------------------
  // Positive Test Scenario
  // ------------------------------------------------------------------

  test('Scenario: Referral pricing applied correctly', async () => {
    // Act: Candidate applies a referral code
    const result = await subscriptionService.createPendingSubscription({
      candidateId: CANDIDATE_ID,
      candidateEmail: CANDIDATE_EMAIL,
      referralCode: REFERRAL_CODE,
    });

    // Assert: Verify the observable output (Backend Response)
    // This confirms the UI receives the correct price to show/charge the user
    expect(result.pricePaid).toBe(365);
    expect(result.pricingSource).toBe(PricingSource.REFERRAL);

    // Assert: Verify Persistence (Safety)
    // This confirms the database record (source of truth for payment) is correct
    expect(mockSubscriptionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        candidateId: CANDIDATE_ID,
        pricePaid: 365,
        pricingSource: PricingSource.REFERRAL,
        status: 'PENDING',
      })
    );
  });

  // ------------------------------------------------------------------
  // Negative / Safety Checks
  // ------------------------------------------------------------------

  test('Safety: Should use default price (₹1199) when NO referral code is provided', async () => {
    // Act
    const result = await subscriptionService.createPendingSubscription({
      candidateId: CANDIDATE_ID,
      candidateEmail: CANDIDATE_EMAIL,
      referralCode: undefined,
    });

    // Assert
    expect(result.pricePaid).toBe(1199);
    expect(result.pricingSource).toBe(PricingSource.DEFAULT);
    
    // Ensure we didn't accidentally apply the referral price
    expect(result.pricePaid).not.toBe(365);
  });

  test('Safety: Should ignore frontend-injected price values', async () => {
    // This simulates a malicious request where the frontend tries to dictate the price
    const maliciousInput = {
      candidateId: CANDIDATE_ID,
      candidateEmail: CANDIDATE_EMAIL,
      referralCode: undefined,
      price: 1, // Attacker tries to pay ₹1
      pricePaid: 1,
    } as any;

    // Act
    const result = await subscriptionService.createPendingSubscription(maliciousInput);

    // Assert: The system should ignore the injected price and calculate 1199 internally
    expect(result.pricePaid).toBe(1199);
    
    expect(mockSubscriptionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        pricePaid: 1199, // Database record must be correct
      })
    );
  });

  test('Safety: Should prevent duplicate active subscriptions', async () => {
    // Setup: Simulate existing active subscription
    mockSubscriptionRepo.findFirstActiveByCandidate.mockResolvedValue({
      id: 'existing-sub',
      candidateId: CANDIDATE_ID,
      status: 'ACTIVE',
    } as any);

    // Act & Assert
    await expect(
      subscriptionService.createPendingSubscription({
        candidateId: CANDIDATE_ID,
        candidateEmail: CANDIDATE_EMAIL,
        referralCode: REFERRAL_CODE,
      })
    ).rejects.toThrow('Candidate already has an active subscription');

    // Ensure no new subscription was created
    expect(mockSubscriptionRepo.create).not.toHaveBeenCalled();
  });
});
