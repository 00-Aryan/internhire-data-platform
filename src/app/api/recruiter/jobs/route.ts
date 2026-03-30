// src/app/api/recruiter/jobs/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';
import { getSessionUser } from '@/core/auth/authUtils';
import { JobStatus } from '@prisma/client';

/* -------------------------------------------------------------------------- */
/* GET – Fetch recruiter's posted / review jobs                                */
/* -------------------------------------------------------------------------- */
export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user?.recruiterProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobs = await prisma.jobListing.findMany({
      where: {
        recruiterId: user.recruiterProfile.id,
        status: {
          in: [
            JobStatus.UNDER_REVIEW,
            JobStatus.APPROVED,
            JobStatus.CLOSED,
          ],
        },
      },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Fetch recruiter jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* POST – Create a new job (publish flow)                                      */
/* -------------------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();

    if (!user?.recruiterProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    /* ------------------------------------------------------------------ */
    /* NORMALIZATION LAYER (CRITICAL)                                      */
    /* ------------------------------------------------------------------ */

    const stipendAmount =
      body.isPaid && body.stipendAmount !== ''
        ? Number(body.stipendAmount)
        : null;

    const job = await prisma.jobListing.create({
      data: {
        recruiterId: user.recruiterProfile.id,

        title: body.title.trim(),
        description: body.description.trim(),

        type: body.type || null,
        workMode: body.workMode || null,
        domain: body.domain || null,

        locationCity: body.locationCity || null,
        locationDistrict: body.locationDistrict || null,
        locationState: body.locationState || null,

        ...(body.deadline && {
          deadline: new Date(body.deadline),
        }),

        ...(body.startDate && {
          startDate: new Date(body.startDate),
        }),

        ...(body.endDate && {
          endDate: new Date(body.endDate),
        }),

        officeDaysPerWeek:
          typeof body.officeDaysPerWeek === 'number'
            ? body.officeDaysPerWeek
            : null,

        isPaid: Boolean(body.isPaid),

        stipendAmount,
        stipendFrequency: body.stipendFrequency || null,

        hasCertificate: Boolean(body.hasCertificate),

        customPhone: body.customPhone || null,
        customEmail: body.customEmail || null,

        status: JobStatus.UNDER_REVIEW,
      },
    });



    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}