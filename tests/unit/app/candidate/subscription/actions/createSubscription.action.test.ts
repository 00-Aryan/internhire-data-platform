import { createSubscriptionAction } from '@/app/(main)/candidate/subscription/actions/createSubscription.action';
import { SubscriptionService } from '@/core/subscription/subscriptionService';

// --- Mocks ---

// Mock all dependencies to prevent actual DB connections or logic execution
jest.mock('@/core/subscription/subscriptionService');
jest.mock('@/core/subscription/subscriptionRepository');
jest.mock('@/core/referral/referralService');
jest.mock('@/core/referral/referralRepository');
jest.mock('@/core/wallet/walletService');
jest.mock('@/core/wallet/walletRepository');

describe('createSubscriptionAction (Unit)', () => {
  const mockCreatePendingSubscription = jest.fn();

  // Setup the mock implementation for SubscriptionService
  // When 'new SubscriptionService(...)' is called, it returns this object
  beforeAll(() => {
    (SubscriptionService as jest.Mock).mockImplementation(() => ({
      createPendingSubscription: mockCreatePendingSubscription,
    }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output during failure cases
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  const input = {
    candidateId: 'cand_123',
    candidateEmail: 'test@example.com',
    referralCode: 'REF_CODE',
  };

  it('should return success with subscriptionId when service succeeds', async () => {
    // Arrange
    mockCreatePendingSubscription.mockResolvedValue({ id: 'sub_new_123' });

    // Act
    const result = await createSubscriptionAction(input);

    // Assert
    expect(result).toEqual({
      ok: true,
      subscriptionId: 'sub_new_123',
    });
    expect(mockCreatePendingSubscription).toHaveBeenCalledWith({
      candidateId: input.candidateId,
      candidateEmail: input.candidateEmail,
      referralCode: input.referralCode,
    });
  });

  it('should return ALREADY_ACTIVE reason when service throws specific error', async () => {
    // Arrange
    mockCreatePendingSubscription.mockRejectedValue(
      new Error('Candidate already has an active subscription')
    );

    // Act
    const result = await createSubscriptionAction(input);

    // Assert
    expect(result).toEqual({
      ok: false,
      reason: 'ALREADY_ACTIVE',
    });
  });

  it('should return FAILED reason for generic errors', async () => {
    // Arrange
    mockCreatePendingSubscription.mockRejectedValue(
      new Error('Database connection failed')
    );

    // Act
    const result = await createSubscriptionAction(input);

    // Assert
    expect(result).toEqual({
      ok: false,
      reason: 'FAILED',
    });
    // Ensure we logged the error (mocked above)
    expect(console.error).toHaveBeenCalled();
  });
});