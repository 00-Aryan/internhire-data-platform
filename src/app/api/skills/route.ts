import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const skills = await prisma.skill.findMany({
    where: {
      name: {
        contains: q,
        mode: 'insensitive',
      },
    },
    orderBy: { name: 'asc' },
    take: 10,
  });

  return NextResponse.json(skills);
}
