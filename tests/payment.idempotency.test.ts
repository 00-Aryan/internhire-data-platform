/**
 * @jest-environment node
 */
import { POST } from '../src/app/api/payment/route';
import { prisma } from '@/infra/db/prisma.client';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Ensure env vars are set for the route's top-level initialization if needed
if (!process.env.RAZORPAY_KEY_SECRET) process.env.RAZORPAY_KEY_SECRET = 'test_secret';
if (!process.env.RAZORPAY_KEY_ID) process.env.RAZORPAY_KEY_ID = 'test_key';

describe('Payment Idempotency Integration Test', () => {
  let userId: string;
  let candidateId: string;

  // Fixed IDs for idempotency check
  const razorpayPaymentId = `pay_idemp_${Date.now()}`;
  const razorpayOrderId = `order_idemp_${Date.now()}`;

  // Helper to generate valid signature
  const generateSignature = (orderId: string, paymentId: string) => {
    return crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  };

  beforeAll(async () => {
    // Create a fresh candidate for isolation
    const user = await prisma.user.create({
      data: {
        email: `idempotency.${Date.now()}@example.com`,
        password: 'hashed_password',
        phone: `99999${Math.floor(Math.random() * 100000)}`,
        name: 'Idempotency Test User',
        candidateProfile: {
          create: {
            city: 'Test City',
          },
        },
      },
      include: { candidateProfile: true },
    });

    userId = user.id;
    candidateId = user.candidateProfile!.id;

    // Create referral record (required by SubscriptionService logic)
    await prisma.referral.create({
      data: {
        candidateId,
        referralCode: `REF_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      },
    });

    // Ensure clean slate
    await prisma.subscription.deleteMany({ where: { candidateId } });
    await prisma.payment.deleteMany({ where: { candidateId } });
  });

  afterAll(async () => {
    // Clean up DB
    if (candidateId) {
      await prisma.referral.deleteMany({ where: { candidateId } });
      await prisma.payment.deleteMany({ where: { candidateId } });
      await prisma.subscription.deleteMany({ where: { candidateId } });
      
      // Clean up wallet if exists (created by subscription service)
      const wallet = await prisma.wallet.findUnique({ where: { candidateId } });
      if (wallet) {
        await prisma.walletTransaction.deleteMany({ where: { walletId: wallet.id } });
        await prisma.wallet.delete({ where: { id: wallet.id } });
      }
      
      await prisma.candidateProfile.delete({ where: { id: candidateId } });
    }
    if (userId) {
      await prisma.user.delete({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });

  it('should NOT activate subscription twice for same razorpay_payment_id', async () => {
    const signature = generateSignature(razorpayOrderId, razorpayPaymentId);
    const amount = 1199;

    const payload = {
      action: 'verify_payment',
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: signature,
      amount,
      candidateId,
    };

    // --- 1. First Request ---
    const req1 = new NextRequest('http://localhost:3000/api/payment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const res1 = await POST(req1);
    const data1 = await res1.json();

    // Assertions for first request
    expect(res1.status).toBe(200);
    expect(data1.success).toBe(true);
    expect(data1.message).toBe('Payment verified successfully');

    // Verify DB: 1 Subscription, 1 Payment
    const subs1 = await prisma.subscription.findMany({ where: { candidateId } });
    expect(subs1).toHaveLength(1);
    expect(subs1[0].status).toBe('ACTIVE');

    const pays1 = await prisma.payment.findMany({ where: { razorpayPaymentId } });
    expect(pays1).toHaveLength(1);

    // --- 2. Second Request (Idempotency Check) ---
    const req2 = new NextRequest('http://localhost:3000/api/payment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const res2 = await POST(req2);
    const data2 = await res2.json();

    // Assertions for second request
    expect(res2.status).toBe(200);
    expect(data2.success).toBe(true);
    expect(data2.alreadyProcessed).toBe(true);
    expect(data2.message).toBe('Payment already processed');
    expect(data2.paymentId).toBe(data1.paymentId);

    // Verify DB: Still 1 Subscription, 1 Payment
    const subs2 = await prisma.subscription.findMany({ where: { candidateId } });
    expect(subs2).toHaveLength(1);
    expect(pays1).toHaveLength(1);
  });
});