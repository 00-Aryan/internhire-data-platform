import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/infra/email';

import { prisma } from '@/infra/db/prisma.client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      firstName,
      lastName,
      email,
      phone,
      password,
      role
    } = body;

    const fullName = (name ?? `${firstName ?? ''} ${lastName ?? ''}`.trim()).trim();
    const phoneValue = phone && phone.trim() !== '' ? phone : `temp-${randomUUID()}`;

    // 1. Basic Validation
    if (!fullName || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['CANDIDATE', 'RECRUITER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    const orConditions: Array<{ email?: string; phone?: string }> = [{ email }];
    if (phone && phone.trim() !== '') {
      orConditions.push({ phone: phone.trim() });
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: orConditions
      },
      include: {
        candidateProfile: true,
        recruiterProfile: true
      }
    });

    // Check if user already exists
    if (existingUser) {
      // User exists - check if they're trying to add a new profile
      if (role === 'RECRUITER' && existingUser.recruiterProfile) {
        return NextResponse.json(
          { error: 'You already have a recruiter account. Please log in instead.' },
          { status: 400 }
        );
      }

      if (role === 'CANDIDATE' && existingUser.candidateProfile) {
        return NextResponse.json(
          { error: 'You already have a candidate account. Please log in instead.' },
          { status: 400 }
        );
      }

      // Verify password matches existing account
      const passwordMatches = await bcrypt.compare(password, existingUser.password);
      if (!passwordMatches) {
        return NextResponse.json(
          { error: 'An account with this email exists. Please use the correct password or log in to add a new profile.' },
          { status: 400 }
        );
      }

      // Create the new profile for existing user
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        if (role === 'RECRUITER') {
          const establishment = await tx.establishment.create({
            data: {
              name: null,
              type: 'COMPANY_PVT_LTD',
            }
          })

          await tx.recruiterProfile.create({
            data: {
              userId: existingUser.id,
              establishmentId: establishment.id,
              jobsPostedThisMonth: 0,
              jobPostLimit: null,
            }
          });
        } else if (role === 'CANDIDATE') {
          await tx.candidateProfile.create({
            data: {
              userId: existingUser.id,
            }
          });
        }

        return existingUser;
      });

      return NextResponse.json(
        {
          message: `${role === 'RECRUITER' ? 'Recruiter' : 'Candidate'} profile added successfully to your account`,
          userId: result.id
        },
        { status: 201 }
      );
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = randomUUID();

    // Create new user with profile
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name: fullName,
          email,
          phone: phoneValue,
          password: hashedPassword,
          verificationToken,
          emailVerified: null,
          verificationEmailSentAt: new Date(),
          verificationEmailCount: 1,
        }
      });

      // Create the requested profile with subscription logic
      if (role === 'RECRUITER') {
        const establishment = await tx.establishment.create({
          data: {
            name: null,
            type: 'COMPANY_PVT_LTD',
          }
        });

        await tx.recruiterProfile.create({
          data: {
            userId: user.id,
            establishmentId: establishment.id,
            jobsPostedThisMonth: 0,
          }
        });
      } else if (role === 'CANDIDATE') {
        await tx.candidateProfile.create({
          data: {
            userId: user.id,
          }
        });
      }

      return user;
    });

    // Send Verification Email
    const emailResult = await sendVerificationEmail(email, fullName, verificationToken);

    if (!emailResult.success) {
      console.error('Verification email failed for user:', result.id);
    }


    return NextResponse.json(
  { 
    message: 'Account created. Please verify your email.',
    userId: result.id 
  },
  { status: 201 }
);


  } catch (error: unknown) {
    console.error('Signup Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
