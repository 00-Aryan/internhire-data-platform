import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/infra/db/prisma.client';
import { applicationSchema } from '@/shared/validation/validation';
import { sanitizeError } from '@/lib/errors';

import { checkCapability } from '@/core/profile-readiness';
import type { UserProfileData } from '@/core/profile-readiness';
import { getSessionUser } from '@/core/auth/authUtils';

import { applyToJob } from '@/core/applications/applyToJob.service';
import { ApplicationError } from '@/core/applications/application.errors';
import { SubscriptionReadService } from '@/core/subscription/subscriptionReadService';

export async function POST(req: Request) {
  try {
    // 1. Auth
    const user = await getSessionUser();

    if (!user || !user.candidateProfile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 🔒 Subscription guard 
    const subscriptionService = new SubscriptionReadService();
    const hasActiveSubscription = await subscriptionService.isCandidateSubscriptionActive(user.candidateProfile.id);

    if (!hasActiveSubscription) {
      return NextResponse.json(
        { error: 'SUBSCRIPTION_REQUIRED' },
        { status: 403 }
      );
    }


    // 2. Validate input
    const body = await req.json();
    const { jobId } = applicationSchema.parse(body);

    // 3. Load candidate for readiness
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: user.candidateProfile.id },
      include: {
        user: true,
        tenthEducation: true,
        twelfthEducation: true,
        ugEducation: true,
        pgEducation: true,
        experience: true,
        skills: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      );
    }

    // 4. Build readiness profile
    const nameParts = candidate.user.name.split(' ');
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(' ') || null;

    const profileData: UserProfileData = {
      userId: candidate.userId,
      role: 'CANDIDATE',
      candidateProfile: {
        id: candidate.id,
        dob: candidate.dob,
        user: {
          firstName,
          lastName,
          email: candidate.user.email,
        },
        phone: candidate.user.phone,
        tenthEducation: candidate.tenthEducation,
        twelfthEducation: candidate.twelfthEducation,
        ugEducation: candidate.ugEducation,
        pgEducation: candidate.pgEducation,
        experience: candidate.experience,
        skills: candidate.skills,
      },
    };

    // 5. Readiness gate
    const readiness = await checkCapability({
      user: profileData,
      capability: 'apply_to_job',
    });

    if (!readiness.allowed) {
      return NextResponse.json(
        {
          error: readiness.reason || 'PROFILE_INCOMPLETE',
          missing: readiness.missing,
        },
        { status: 400 }
      );
    }

    // 7. Domain service
    const application = await applyToJob({
      jobId,
      candidateId: candidate.id,
    });

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    // 🔒 Typed domain error handling
    if (error instanceof ApplicationError) {
      return NextResponse.json(
        { error: error.code },
        { status: 400 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.format() },
        { status: 400 }
      );
    }

    console.error('[apply] error:', error);

    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 400 }
    );
  }
}
