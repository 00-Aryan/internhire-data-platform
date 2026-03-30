import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';
import { getSessionUser } from '@/core/auth/authUtils';
import { JobStatus } from '@prisma/client';


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ draftId: string }> }
) {
  const { draftId } = await params;

  const user = await getSessionUser();
  if (!user?.recruiterProfile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const job = await prisma.jobListing.findUnique({
  where: { id: draftId },
  include: {
    requiredSkills: {
      include: {
        skill: true,
      },
    },
  },
});

  if (!job || job.recruiterId !== user.recruiterProfile.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (job.status !== JobStatus.DRAFT) {
    return NextResponse.json(
      { error: 'Not a draft' },
      { status: 400 }
    );
  }

  return NextResponse.json({ draft: job });
}



export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ draftId: string }> }
) {
  const user = await getSessionUser();
  if (!user?.recruiterProfile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { draftId } = await params;
  const body = await req.json();

  const job = await prisma.jobListing.findUnique({
    where: { id: draftId },
  });

  if (!job || job.recruiterId !== user.recruiterProfile.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (job.status !== JobStatus.DRAFT) {
    return NextResponse.json(
      { error: 'Only drafts can be edited' },
      { status: 400 }
    );
  }

  const { requiredSkills, ...fields } = body;

  const updated = await prisma.$transaction(async (tx) => {
    const updatedJob = await tx.jobListing.update({
      where: { id: job.id },
      data: {
        ...(fields.title !== undefined && { title: fields.title.trim() }),
        ...(fields.description !== undefined && { description: fields.description ?? null }),
        ...(fields.type !== undefined && { type: fields.type ?? null }),
        ...(fields.workMode !== undefined && { workMode: fields.workMode ?? null }),
        ...(fields.domain !== undefined && { domain: fields.domain ?? null }),
        ...(fields.locationCity !== undefined && { locationCity: fields.locationCity ?? null }),
        ...(fields.locationDistrict !== undefined && { locationDistrict: fields.locationDistrict ?? null }),
        ...(fields.locationState !== undefined && { locationState: fields.locationState ?? null }),

        ...(fields.deadline !== undefined && {
          deadline: fields.deadline ? new Date(fields.deadline) : null,
        }),
        ...(fields.startDate !== undefined && {
          startDate: fields.startDate ? new Date(fields.startDate) : null,
        }),
        ...(fields.endDate !== undefined && {
          endDate: fields.endDate ? new Date(fields.endDate) : null,
        }),

        ...(fields.officeDaysPerWeek !== undefined && {
          officeDaysPerWeek:
            typeof fields.officeDaysPerWeek === 'number'
              ? fields.officeDaysPerWeek
              : null,
        }),

        ...(fields.isPaid !== undefined && { isPaid: fields.isPaid }),

        ...(fields.isPaid === false && {
          stipendAmount: null,
          stipendFrequency: null,
        }),

        ...(fields.stipendAmount !== undefined && {
          stipendAmount:
            typeof fields.stipendAmount === 'number'
              ? fields.stipendAmount
              : null,
        }),

        ...(fields.stipendFrequency !== undefined && {
          stipendFrequency: fields.stipendFrequency ?? null,
        }),

        ...(fields.hasCertificate !== undefined && {
          hasCertificate: fields.hasCertificate,
        }),

        ...(fields.customPhone !== undefined && {
          customPhone: fields.customPhone ?? null,
        }),

        ...(fields.customEmail !== undefined && {
          customEmail: fields.customEmail ?? null,
        }),
      },
    });

    if (requiredSkills !== undefined) {
      await tx.jobSkill.deleteMany({ where: { jobId: job.id } });

      if (Array.isArray(requiredSkills) && requiredSkills.length > 0) {
        await tx.jobSkill.createMany({
          data: requiredSkills.map((skillId: string) => ({
            jobId: job.id,
            skillId,
          })),
        });
      }
    }

    return updatedJob;
  });


  return NextResponse.json({ success: true, draft: updated });
}
