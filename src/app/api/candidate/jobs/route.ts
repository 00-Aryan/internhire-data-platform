import { NextResponse } from 'next/server';
import { JobStatus } from '@prisma/client';
import { prisma } from '@/infra/db/prisma.client';

export async function GET() {
  try {
    const jobs = await prisma.jobListing.findMany({
      where: {
        status: JobStatus.APPROVED,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        type: true,
        workMode: true,
        locationCity: true,
        isPaid: true,
        stipendAmount: true,
        recruiter: {
          select: {
            establishment: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching candidate internships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch internships' },
      { status: 500 }
    );
  }
}