import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get('domainId');

  if (!domainId) {
    return NextResponse.json([]);
  }

  try {
    const subdomains = await prisma.subdomain.findMany({
      where: { domainId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(subdomains);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}