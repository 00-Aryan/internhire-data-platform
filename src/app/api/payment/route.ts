import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '@/infra/db/prisma.client';

import { SubscriptionService } from '@/core/subscription/subscriptionService';
import { SubscriptionRepository } from '@/core/subscription/subscriptionRepository';
import { ReferralService } from '@/core/referral/referralService';
import { ReferralRepository } from '@/core/referral/referralRepository';
import { WalletService } from '@/core/wallet/walletService';
import { WalletRepository } from '@/core/wallet/walletRepository';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /* ---------- CREATE ORDER ---------- */
    if (body.action === 'create_order') {
      const { amount } = body;

      if (!amount || amount <= 0) {
        return NextResponse.json(
          { success: false, message: 'Invalid amount' },
          { status: 400 }
        );
      }

      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      });

      return NextResponse.json({
        success: true,
        order,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    /* ---------- VERIFY PAYMENT ---------- */
    if (body.action === 'verify_payment') {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        subscriptionId,
        candidateId,
        amount,
      } = body;

      if (!subscriptionId || !candidateId) {
        return NextResponse.json(
          { success: false, message: 'Missing subscription reference' },
          { status: 400 }
        );
      }

      // 1️⃣ Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json(
          { success: false, message: 'Invalid signature' },
          { status: 400 }
        );
      }

      // 2️⃣ Idempotency check
      const existingPayment = await prisma.payment.findUnique({
        where: { razorpayPaymentId: razorpay_payment_id },
      });

      if (existingPayment) {
        return NextResponse.json({
          success: true,
          alreadyProcessed: true,
        });
      }

      // 3️⃣ Persist payment
      await prisma.payment.create({
        data: {
          amount: Number(amount) * 100,
          status: 'SUCCESS',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          candidateId,
        },
      });

      // 4️⃣ Activate subscription (domain service)
      const subscriptionService = new SubscriptionService(
        new SubscriptionRepository(),
        new ReferralService(new ReferralRepository()),
        new WalletService(new WalletRepository())
      );

      await subscriptionService.activatePendingSubscription(subscriptionId);

      return NextResponse.json({
        success: true,
        message: 'Payment verified & subscription activated',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Payment route error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
