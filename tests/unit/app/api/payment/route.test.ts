import { POST } from '@/app/api/payment/route';
import { SubscriptionService } from '@/core/subscription/subscriptionService';
import { getSessionUser } from '@/core/auth/authUtils';
import { prisma } from '@/infra/db/prisma.client';
import crypto from 'crypto';

// --- Mocks ---

// 1. Mock Next.js Server objects
// We mock these to avoid needing a full Next.js server environment
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

// 2. Mock Dependencies
jest.mock('@/core/subscription/subscriptionService');
jest.mock('@/core/subscription/subscriptionRepository');
jest.mock('@/core/referral/referralService');
jest.mock('@/core/referral/referralRepository');
jest.mock('@/core/wallet/walletService');
jest.mock('@/core/wallet/walletRepository');
jest.mock('@/core/auth/authUtils');
jest.mock('@/infra/db/prisma.client', () => ({
  prisma: {
    payment: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// 3. Mock Razorpay
const mockOrdersCreate = jest.fn();
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: (...args: any[]) => mockOrdersCreate(...args),
    },
  }));
});

describe('Payment API Route (Unit)', () => {
  const mockCreatePendingSubscription = jest.fn();
  const mockActivatePendingSubscription = jest.fn();

  beforeAll(() => {
    // Setup Env vars required by the route
    process.env.RAZORPAY_KEY_ID = 'test_key';
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';

    // Setup Service Mock
    (SubscriptionService as jest.Mock).mockImplementation(() => ({
      createPendingSubscription: mockCreatePendingSubscription,
      activatePendingSubscription: mockActivatePendingSubscription,
    }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('POST - create_order', () => {
    it('should return 401 if user is not authenticated', async () => {
      (getSessionUser as jest.Mock).mockResolvedValue(null);

      const req = new (require('next/server').NextRequest)('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ action: 'create_order' }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('should create pending subscription and razorpay order', async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        candidateProfile: { id: 'cand_123' },
      });

      mockCreatePendingSubscription.mockResolvedValue({
        id: 'sub_123',
        pricePaid: 1000,
      });

      mockOrdersCreate.mockResolvedValue({
        id: 'order_rzp_123',
        amount: 100000,
      });

      const req = new (require('next/server').NextRequest)('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ action: 'create_order', referralCode: 'REF' }),
      });

      const res = await POST(req);

      expect(mockCreatePendingSubscription).toHaveBeenCalledWith({
        candidateId: 'cand_123',
        candidateEmail: 'test@example.com',
        referralCode: 'REF',
      });

      expect(mockOrdersCreate).toHaveBeenCalledWith({
        amount: 100000,
        currency: 'INR',
        receipt: 'sub_sub_123',
      });

      expect((res as any).jsonBody).toEqual({
        success: true,
        order: expect.objectContaining({ id: 'order_rzp_123' }),
        subscriptionId: 'sub_123',
        keyId: 'test_key',
      });
    });
  });

  describe('POST - verify_payment', () => {
    const verifyPayload = {
      action: 'verify_payment',
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'valid_signature',
      subscriptionId: 'sub_123',
    };

    it('should return 400 if signature is invalid', async () => {
      // Mock crypto to return invalid signature
      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('invalid_signature'),
      };
      jest.spyOn(crypto, 'createHmac').mockReturnValue(mockHmac as any);

      const req = new (require('next/server').NextRequest)('http://localhost', {
        method: 'POST',
        body: JSON.stringify(verifyPayload),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      expect((res as any).jsonBody.message).toBe('Invalid signature');
    });

    it('should persist payment and activate subscription if valid', async () => {
      // Mock crypto to return VALID signature
      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('valid_signature'),
      };
      jest.spyOn(crypto, 'createHmac').mockReturnValue(mockHmac as any);

      // Mock no existing payment (not duplicate)
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new (require('next/server').NextRequest)('http://localhost', {
        method: 'POST',
        body: JSON.stringify(verifyPayload),
      });

      const res = await POST(req);

      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          razorpayPaymentId: 'pay_123',
          subscriptionId: 'sub_123',
          status: 'SUCCESS',
        }),
      });

      expect(mockActivatePendingSubscription).toHaveBeenCalledWith('sub_123');
      expect((res as any).jsonBody.success).toBe(true);
    });
  });
});