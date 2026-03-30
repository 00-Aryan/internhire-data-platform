// src/app/api/recruiter/drafts/jobs/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';
import { getSessionUser } from '@/core/auth/authUtils';

/* -------------------------------------------------------------------------- */
/* POST - Create a new Job Draft                                               */
/* -------------------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    // 1. AUTH
    const user = await getSessionUser();
    if (!user?.recruiterProfile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const recruiterId = user.recruiterProfile.id;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // 2. MINIMAL VALIDATION (DRAFT RULES)
    const title =
      typeof body.title === 'string' ? body.title.trim() : '';

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required to save a draft' },
        { status: 400 }
      );
    }

    // 3. CREATE DRAFT (NO BUSINESS LOGIC)
    const draft = await prisma.jobDraft.create({
      data: {
        recruiterId,
        title,

        // Optional fields – no validation here by design
        description: body.description ?? null,
        type: body.type ?? null,
        workMode: body.workMode ?? null,
        domain: body.domain ?? null,
        locationCity: body.locationCity ?? null,
        locationDistrict: body.locationDistrict ?? null,
        locationState: body.locationState ?? null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        officeDaysPerWeek:
          typeof body.officeDaysPerWeek === 'number'
            ? body.officeDaysPerWeek
            : null,
        isPaid:
          typeof body.isPaid === 'boolean'
            ? body.isPaid
            : null,
        stipendAmount:
          typeof body.stipendAmount === 'number'
            ? body.stipendAmount
            : null,
        stipendFrequency: body.stipendFrequency ?? null,
        hasCertificate:
          typeof body.hasCertificate === 'boolean'
            ? body.hasCertificate
            : null,
        customPhone: body.customPhone ?? null,
        customEmail: body.customEmail ?? null,
      },
    });

    return NextResponse.json(
      { success: true, draft },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create draft error:', error);
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* GET - List recruiter Job Drafts                                             */
/* -------------------------------------------------------------------------- */
export async function GET() {
  try {
    // 1. AUTH
    const user = await getSessionUser();
    if (!user?.recruiterProfile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const recruiterId = user.recruiterProfile.id;

    // 2. FETCH DRAFTS (OWNER-ONLY)
    const drafts = await prisma.jobDraft.findMany({
      where: { recruiterId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('Fetch drafts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}
