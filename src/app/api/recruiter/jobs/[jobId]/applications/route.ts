import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/core/auth/authUtils';
import { prisma } from '@/infra/db/prisma.client';

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { jobId } = await params;

    // 1. AUTH CHECK: User must be logged in as recruiter
    const user = await getSessionUser();
    if (!user?.recruiterProfile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. OWNERSHIP CHECK: Job must belong to this recruiter
    const job = await prisma.jobListing.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.recruiterId !== user.recruiterProfile.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 3. FETCH APPLICATIONS: Get all applications for this job
    const applications = await prisma.application.findMany({
      where: {
        jobId,
        job: {
          recruiterId: user.recruiterProfile.id,
        },
      },
      include: {
        job: true,
        candidate: {
          include: {
            user: true,
            ugEducation: { include: { establishment: true } },
            pgEducation: { include: { establishment: true } },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
