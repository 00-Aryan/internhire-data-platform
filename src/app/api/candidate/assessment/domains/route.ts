import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(domains);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}