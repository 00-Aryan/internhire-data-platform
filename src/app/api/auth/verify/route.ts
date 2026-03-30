import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find user with this specific token
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      include: {
        candidateProfile: { select: { id: true } },
        recruiterProfile: { select: { id: true } }
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid or expired verification token. Please request a new one.' 
      }, { status: 400 });
    }

    // Update user status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, // Security: Invalidate token immediately
        isVerified: true // Legacy field support
      }
    });

    // Determine role for redirection
    let role = null;
    if (user.recruiterProfile) role = 'recruiter';
    else if (user.candidateProfile) role = 'candidate';

    return NextResponse.json({ 
      message: 'Email verified successfully.',
      role 
    }, { status: 200 });

  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
