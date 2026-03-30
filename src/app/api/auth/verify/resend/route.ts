import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { sendVerificationEmail } from '@/infra/email'; 
import { prisma } from '@/infra/db/prisma.client';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Security: Don't reveal if user exists or not
      return NextResponse.json({ message: 'If an account exists, a verification email has been sent.' }, { status: 200 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email is already verified.' }, { status: 400 });
    }

    // --- RATE LIMITING LOGIC ---
    const now = new Date();
    const lastSent = user.verificationEmailSentAt;
    const isNewDay = !lastSent || lastSent.getDate() !== now.getDate();

    // 1. Reset count if it's a new day
    let currentCount = isNewDay ? 0 : user.verificationEmailCount;

    // 2. Check Daily Limit (Max 3)
    if (currentCount >= 3) {
      return NextResponse.json({ 
        error: 'You have reached the maximum number of verification emails for today. Please try again tomorrow.' 
      }, { status: 429 });
    }

    // 3. Check Cooldown (1 minute)
    if (lastSent && !isNewDay) {
      const timeDiff = now.getTime() - lastSent.getTime();
      if (timeDiff < 60 * 1000) { // 60 seconds
        const secondsLeft = Math.ceil((60000 - timeDiff) / 1000);
        return NextResponse.json({ 
          error: `Please wait ${secondsLeft} seconds before requesting another email.` 
        }, { status: 429 });
      }
    }

    // --- EXECUTE RESEND ---
    const verificationToken = randomUUID();

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        verificationToken,
        verificationEmailSentAt: now,
        verificationEmailCount: currentCount + 1
      }
    });

    const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);

    if (!emailResult.success) {
      return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Verification email sent successfully.',
      remainingAttempts: 3 - (currentCount + 1)
    }, { status: 200 });

  } catch (error) {
    console.error('Resend Verification Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
