import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { sendVerificationEmail } from '@/infra/email/email.service';
import { prisma } from '@/infra/db/prisma.client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrPhone, password, role } = body;

    if (!emailOrPhone || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // 1. Find User
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone }
        ]
      },
      include: {
        recruiterProfile: true,
        candidateProfile: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2.1 Check Email Verification
    if (!user.emailVerified) {
      return NextResponse.json({ 
        error: 'Your email is not verified. Please check your inbox or request a new verification link.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email 
      }, { status: 403 });
    }

    // 3. Determine role
    let loginRole = role;
    
    // If role is explicitly specified (from login modal)
    if (loginRole) {
      if (!['CANDIDATE', 'RECRUITER'].includes(loginRole)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      
      // Validate user has this role profile
      if (loginRole === 'RECRUITER' && !user.recruiterProfile) {
        return NextResponse.json({ 
          error: 'You do not have a Recruiter profile. Please create one or login as Candidate.',
          availableRoles: user.candidateProfile ? ['CANDIDATE'] : []
        }, { status: 403 });
      }
      if (loginRole === 'CANDIDATE' && !user.candidateProfile) {
        return NextResponse.json({ 
          error: 'You do not have a Candidate profile. Please create one or login as Recruiter.',
          availableRoles: user.recruiterProfile ? ['RECRUITER'] : []
        }, { status: 403 });
      }
    } else {
      // If role not specified, auto-detect
      if (user.recruiterProfile && user.candidateProfile) {
        return NextResponse.json({
          error: 'You have multiple profiles. Please select a role.',
          availableRoles: ['CANDIDATE', 'RECRUITER'],
          requiresRoleSelection: true
        }, { status: 400 });
      }
      // Auto-detect if only one profile exists
      loginRole = user.recruiterProfile ? 'RECRUITER' : 'CANDIDATE';
    }

    // 5. Determine Redirect Path
    let redirectUrl = '/';
    if (loginRole === 'RECRUITER') {
      redirectUrl = '/recruiter';
    } else if (loginRole === 'CANDIDATE') {
      redirectUrl = '/candidate';
    }

    const response = NextResponse.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: loginRole,
        hasRecruiterProfile: !!user.recruiterProfile,
        hasCandidateProfile: !!user.candidateProfile
      },
      redirectUrl 
    });

    // Explicitly set cookies in response headers
    // Note: secure is set to false to support HTTP deployments (VPS without HTTPS)
    // If you add HTTPS later, change this to: secure: process.env.NODE_ENV === 'production'
    response.cookies.set('auth_user', user.id, {
      httpOnly: true,
      secure: false,  // Changed: Allow cookies over HTTP
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax'
    });

    response.cookies.set('auth_role', loginRole, {
      httpOnly: false,
      secure: false,  // Changed: Allow cookies over HTTP
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax'
    });

    // Set cache control headers to prevent caching issues with redirects
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return response;

  } catch (error: unknown) {
    console.error('Login Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
