import { NextResponse } from 'next/server';
import { getSessionUser } from '@/core/auth/authUtils';

import { SubscriptionService } from '@/core/subscription/subscriptionService';
import { SubscriptionRepository } from '@/core/subscription/subscriptionRepository';
import { ReferralService } from '@/core/referral/referralService';
import { ReferralRepository } from '@/core/referral/referralRepository';
import { WalletService } from '@/core/wallet/walletService';
import { WalletRepository } from '@/core/wallet/walletRepository';

export async function POST(req: Request) {
  try {
    /* 1️⃣ Auth */
    const user = await getSessionUser();

    if (!user || !user.candidateProfile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    /* 2️⃣ Parse body (couponCode + referralCode optional) */
    let referralCode: string | undefined;
    let couponCode: string | undefined;

    try {
      const body = await req.json();
      console.info('[API][CREATE_PENDING][BODY]', body);
      if (typeof body?.referralCode === 'string') {
        referralCode = body.referralCode;
      }
      if (typeof body?.couponCode === 'string') {
        couponCode = body.couponCode;
      }
    } catch {
      // body optional – ignore parsing errors
    }

    /* 3️⃣ Construct services (explicit DI) */
    const subscriptionService = new SubscriptionService(
      new SubscriptionRepository(),
      new ReferralService(new ReferralRepository()),
      new WalletService(new WalletRepository())
    );

    /* 4️⃣ Create PENDING subscription */
    const subscription =
      await subscriptionService.createPendingSubscription({
        candidateId: user.candidateProfile.id,
        candidateEmail: user.email,
        referralCode,
        couponCode,
      });

    console.info('[API][DB][SUBSCRIPTION_CREATED]', subscription);

    /* 5️⃣ Return minimal response */
    return NextResponse.json(
      {
        subscriptionId: subscription.id,
        pricePaid: subscription.pricePaid,
        pricingSource: subscription.pricingSource,
      },
      { status: 201 }
    );

  } catch (error: any) {
    if (error?.message === 'Candidate already has an active subscription') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    console.error('create-pending error:', error);
    return NextResponse.json(
      { error: 'Failed to create pending subscription' },
      { status: 400 }
    );
  }
}
