import { POST } from '@/app/api/payment/route';
import { prisma } from '@/infra/db/prisma.client';
import { SubscriptionService } from '@/core/subscription/subscriptionService';
import crypto from 'crypto';

// --- Mocks ---

// Mock Prisma
jest.mock('@/infra/db/prisma.client', () => ({
  prisma: {
    payment: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock SubscriptionService and dependencies
jest.mock('@/core/subscription/subscriptionService');
jest.mock('@/core/subscription/subscriptionRepository');
jest.mock('@/core/referral/referralService');
jest.mock('@/core/referral/referralRepository');
jest.mock('@/core/wallet/walletService');
jest.mock('@/core/wallet/walletRepository');

// Mock Razorpay (required import, even if not used in verify branch)
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn(),
    },
  }));
});

// Mock Next.js Server objects
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    json: async () => JSON.parse(init.body),
    url,
  })),
  NextResponse: {
    json: jest.fn((body, init) => ({
      jsonBody: body,
      status: init?.status || 200,
    })),
  },
}));

describe('POST /api/payment (verify_payment)', () => {
  const mockActivatePendingSubscription = jest.fn();

  beforeAll(() => {
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';
    process.env.RAZORPAY_KEY_ID = 'test_key';

    // Mock SubscriptionService instance
    (SubscriptionService as jest.Mock).mockImplementation(() => ({
      activatePendingSubscription: mockActivatePendingSubscription,
    }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // Helper to create request
  const createRequest = (body: any) => {
    return new (require('next/server').NextRequest)('http://localhost/api/payment', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  // Helper to mock crypto signature verification
  const mockCrypto = (expectedSignature: string) => {
    jest.spyOn(crypto, 'createHmac').mockImplementation(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue(expectedSignature),
    } as any));
  };

  it('fails if signature is invalid', async () => {
    mockCrypto('valid_signature');

    const req = createRequest({
      action: 'verify_payment',
      razorpay_order_id: 'order_1',
      razorpay_payment_id: 'pay_1',
      razorpay_signature: 'invalid_signature', // Mismatch
      subscriptionId: 'sub_1',
      candidateId: 'cand_1',
      amount: 1000,
    });

    const res = await POST(req);

    expect((res as any).status).toBe(400);
    expect((res as any).jsonBody.message).toBe('Invalid signature');
  });

  it('fails if candidateId is missing', async () => {
    const req = createRequest({
      action: 'verify_payment',
      razorpay_order_id: 'order_1',
      razorpay_payment_id: 'pay_1',
      razorpay_signature: 'sig',
      subscriptionId: 'sub_1',
      // candidateId missing
      amount: 1000,
    });

    const res = await POST(req);

    expect((res as any).status).toBe(400);
    expect((res as any).jsonBody.message).toBe('Missing subscription reference');
  });

  it('creates payment record exactly once (idempotency)', async () => {
    mockCrypto('valid_signature');
    // Simulate existing payment found
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue({ id: 'pay_existing' });

    const req = createRequest({
      action: 'verify_payment',
      razorpay_order_id: 'order_1',
      razorpay_payment_id: 'pay_1',
      razorpay_signature: 'valid_signature',
      subscriptionId: 'sub_1',
      candidateId: 'cand_1',
      amount: 1000,
    });

    const res = await POST(req);

    expect((res as any).status).toBe(200);
    expect((res as any).jsonBody.alreadyProcessed).toBe(true);
    expect(prisma.payment.create).not.toHaveBeenCalled();
    expect(mockActivatePendingSubscription).not.toHaveBeenCalled(); // Should NOT activate again
  });

  it('activates pending subscription on valid payment', async () => {
    mockCrypto('valid_signature');
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null); // No existing payment

    const req = createRequest({
      action: 'verify_payment',
      razorpay_order_id: 'order_1',
      razorpay_payment_id: 'pay_1',
      razorpay_signature: 'valid_signature',
      subscriptionId: 'sub_1',
      candidateId: 'cand_1',
      amount: 1000,
    });

    const res = await POST(req);

    expect((res as any).status).toBe(200);
    expect((res as any).jsonBody.success).toBe(true);

    // Verify Payment Persistence
    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        razorpayPaymentId: 'pay_1',
        status: 'SUCCESS',
        candidateId: 'cand_1',
        amount: 100000, // 1000 * 100
      }),
    });

    // Verify Subscription Activation
    expect(mockActivatePendingSubscription).toHaveBeenCalledWith('sub_1');
  });
});