import { POST } from '@/app/api/subscription/create-pending/route';
import { getSessionUser } from '@/core/auth/authUtils';
import { SubscriptionService } from '@/core/subscription/subscriptionService';

// --- Mocks ---
jest.mock('@/core/auth/authUtils');
jest.mock('@/core/subscription/subscriptionService');
jest.mock('@/core/subscription/subscriptionRepository');
jest.mock('@/core/referral/referralService');
jest.mock('@/core/referral/referralRepository');
jest.mock('@/core/wallet/walletService');
jest.mock('@/core/wallet/walletRepository');

// Mock NextResponse to avoid Next.js server environment dependency
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      jsonBody: body,
      status: init?.status || 200,
    })),
  },
}));

describe('POST /api/subscription/create-pending', () => {
  const mockCreatePendingSubscription = jest.fn();

  beforeAll(() => {
    // Mock the SubscriptionService constructor to return our mock methods
    (SubscriptionService as jest.Mock).mockImplementation(() => ({
      createPendingSubscription: mockCreatePendingSubscription,
    }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 401 if user is not authenticated', async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    
    // Mock Request object
    const req = {
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Request;

    const res = await POST(req);

    expect((res as any).status).toBe(401);
    expect((res as any).jsonBody).toEqual({ error: 'Unauthorized' });
    expect(mockCreatePendingSubscription).not.toHaveBeenCalled();
  });

  it('returns 401 if user has no candidate profile', async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({ email: 'test@example.com' }); // No candidateProfile
    
    const req = {
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Request;

    const res = await POST(req);

    expect((res as any).status).toBe(401);
  });

  // Table-driven tests for successful creation scenarios
  const successScenarios = [
    {
      description: 'creates a PENDING subscription with DEFAULT pricing',
      requestBody: {},
      userEmail: 'test@example.com',
      expectedReferralCode: undefined,
    },
    {
      description: 'creates a PENDING subscription with REFERRAL pricing when referralCode provided',
      requestBody: { referralCode: 'REF123' },
      userEmail: 'test@example.com',
      expectedReferralCode: 'REF123',
    },
    {
      description: 'creates a PENDING subscription with COLLEGE pricing when email matches domain',
      requestBody: {},
      userEmail: 'student@smail.iitm.ac.in',
      expectedReferralCode: undefined,
    },
    {
      description: 'handles JSON parsing error gracefully (treats as no referral code)',
      requestBody: null, // Will simulate error in json() mock
      userEmail: 'test@example.com',
      expectedReferralCode: undefined,
      shouldThrowJson: true,
    },
  ];

  test.each(successScenarios)(
    '$description',
    async ({ requestBody, userEmail, expectedReferralCode, shouldThrowJson }) => {
      // Arrange
      const mockUser = {
        email: userEmail,
        candidateProfile: { id: 'cand_123' },
      };
      (getSessionUser as jest.Mock).mockResolvedValue(mockUser);
      
      mockCreatePendingSubscription.mockResolvedValue({ id: 'sub_new_1' });

      const req = {
        json: shouldThrowJson 
          ? jest.fn().mockRejectedValue(new Error('Invalid JSON'))
          : jest.fn().mockResolvedValue(requestBody),
      } as unknown as Request;

      // Act
      const res = await POST(req);

      // Assert
      expect((res as any).status).toBe(201);
      expect((res as any).jsonBody).toEqual({ subscriptionId: 'sub_new_1' });
      
      expect(mockCreatePendingSubscription).toHaveBeenCalledWith({
        candidateId: 'cand_123',
        candidateEmail: userEmail,
        referralCode: expectedReferralCode,
      });
    }
  );

  it('returns 409 if candidate already has an ACTIVE subscription', async () => {
    // Arrange
    (getSessionUser as jest.Mock).mockResolvedValue({
      email: 'test@example.com',
      candidateProfile: { id: 'cand_123' },
    });

    mockCreatePendingSubscription.mockRejectedValue(
      new Error('Candidate already has an active subscription')
    );

    const req = {
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Request;

    // Act
    const res = await POST(req);

    // Assert
    expect((res as any).status).toBe(409);
    expect((res as any).jsonBody).toEqual({ error: 'ALREADY_ACTIVE' });
  });

  it('returns 400 for generic failures', async () => {
    // Arrange
    (getSessionUser as jest.Mock).mockResolvedValue({
      email: 'test@example.com',
      candidateProfile: { id: 'cand_123' },
    });

    mockCreatePendingSubscription.mockRejectedValue(new Error('Database connection failed'));

    const req = {
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Request;

    // Act
    const res = await POST(req);

    // Assert
    expect((res as any).status).toBe(400);
    expect((res as any).jsonBody).toEqual({ error: 'FAILED' });
    expect(console.error).toHaveBeenCalled();
  });
});