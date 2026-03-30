import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, courseName, department, joinYear, currentYear, completionYear, cgpa } = body;

    if (!candidateId || !courseName || !completionYear) {
      return NextResponse.json({ error: 'Missing required fields (candidateId, courseName, completionYear)' }, { status: 400 });
    }

    const education = await prisma.pGEducation.create({
      data: {
        candidateId,
        courseName,
        department: department || null,
        joinYear: joinYear ? parseInt(joinYear) : null,
        currentYear: currentYear ? parseInt(currentYear) : null,
        completionYear: parseInt(completionYear),
        cgpa: cgpa ? parseFloat(cgpa) : null,
      }
    });

    return NextResponse.json({ success: true, education }, { status: 201 });
  } catch (error) {
    console.error('Error adding PG education:', error);
    return NextResponse.json({ error: 'Failed to add PG education' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'PG education ID required' }, { status: 400 });
    }

    await prisma.pGEducation.delete({
      where: { id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting PG education:', error);
    return NextResponse.json({ error: 'Failed to delete PG education' }, { status: 500 });
  }
}
