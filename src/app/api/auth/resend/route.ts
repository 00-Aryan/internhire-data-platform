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
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    const newToken = randomUUID();

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: newToken },
    });

    await sendVerificationEmail(user.email, user.name || 'User', newToken);

    return NextResponse.json({ message: 'Verification email sent' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to resend email' }, { status: 500 });
  }
}
