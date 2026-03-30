import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, companyName, roleTitle, description, startDate, endDate } = body;

    if (!candidateId || !companyName || !roleTitle || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const experience = await prisma.experience.create({
      data: {
        candidateId,
        companyName,
        roleTitle,
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      }
    });

    return NextResponse.json({ success: true, experience }, { status: 201 });
  } catch (error) {
    console.error('Error adding experience:', error);
    return NextResponse.json({ error: 'Failed to add experience' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Experience ID required' }, { status: 400 });
    }

    await prisma.experience.delete({
      where: { id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 });
  }
}
