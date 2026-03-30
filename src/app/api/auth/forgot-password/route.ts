import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { sendPasswordResetEmail } from '@/infra/email/email.service';
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

    if (user) {
      const token = randomUUID();
      // Set token expiry to 1 hour from now
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiry,
        },
      });

      await sendPasswordResetEmail(user.email, token);
    }

    return NextResponse.json({ message: 'If an account exists for this email, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}