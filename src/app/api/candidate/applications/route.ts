import { NextResponse } from 'next/server';
import { getSessionUser } from '@/core/auth/authUtils';
import { prisma } from '@/infra/db/prisma.client';
import { applyToJob } from '@/core/applications/applyToJob.service';
import { ApplicationError } from '@/core/applications/application.errors';



// ------------------------------------
// GET: Fetch job IDs already applied to
// ------------------------------------
export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user || !user.candidateProfile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { candidateId: user.candidateProfile.id },
      select: { jobId: true },
    });

    return NextResponse.json({
      jobIds: applications.map(app => app.jobId),
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// ------------------------------------
// POST: Apply to a job
// ------------------------------------
export async function POST(req: Request) {
  try {
    // 1. Parse body ONCE (route owns body parsing)
    const body = await req.json();
    const { jobId } = body;

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // 2. Auth
    const user = await getSessionUser();

    if (!user || !user.candidateProfile) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 3. Domain call
    await applyToJob({
      jobId,
      candidateId: user.candidateProfile.id,
    });

    // 4. Success
    return NextResponse.json(
      { success: true },
      { status: 201 }
    );

  } catch (error) {
    // 5. Typed domain errors → HTTP
    if (error instanceof ApplicationError) {
      const statusMap: Record<string, number> = {
        INVALID_INPUT: 400,
        UNAUTHORIZED: 401,
        JOB_NOT_FOUND: 404,
        ALREADY_APPLIED: 409,
      };

      return NextResponse.json(
        { code: error.code },
        { status: statusMap[error.code] ?? 400 }
      );
    }

    // 6. Unknown error
    console.error('[POST /api/applications] unexpected error:', error);

    return NextResponse.json(
      { code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
