import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, passingYear, percentageMarks, stream } = body;

    if (!candidateId || !passingYear || percentageMarks === undefined || !stream) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already exists (only one 12th education per candidate)
    const existing = await prisma.twelfthEducation.findUnique({
      where: { candidateId }
    });

    if (existing) {
      return NextResponse.json({ error: '12th education already exists. Use PATCH to update.' }, { status: 400 });
    }

    const education = await prisma.twelfthEducation.create({
      data: {
        candidateId,
        passingYear: parseInt(passingYear),
        percentageMarks: parseFloat(percentageMarks),
        stream,
      }
    });

    return NextResponse.json({ success: true, education }, { status: 201 });
  } catch (error) {
    console.error('Error adding 12th education:', error);
    return NextResponse.json({ error: 'Failed to add 12th education' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, passingYear, percentageMarks, stream } = body;

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId required' }, { status: 400 });
    }

    const education = await prisma.twelfthEducation.update({
      where: { candidateId },
      data: {
        passingYear: passingYear ? parseInt(passingYear) : undefined,
        percentageMarks: percentageMarks !== undefined ? parseFloat(percentageMarks) : undefined,
        stream: stream !== undefined ? stream : undefined,
      }
    });

    return NextResponse.json({ success: true, education }, { status: 200 });
  } catch (error) {
    console.error('Error updating 12th education:', error);
    return NextResponse.json({ error: 'Failed to update 12th education' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId required' }, { status: 400 });
    }

    await prisma.twelfthEducation.delete({
      where: { candidateId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting 12th education:', error);
    return NextResponse.json({ error: 'Failed to delete 12th education' }, { status: 500 });
  }
}
