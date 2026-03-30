import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';
import { getSessionUser } from '@/core/auth/authUtils';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 12);
  const domainId = searchParams.get('domainId');
  const subdomainId = searchParams.get('subdomainId');

  const skip = (page - 1) * limit;

  //  Strongly typed, no `any`
  const where: Prisma.SubdomainWhereInput = {};

  if (domainId) {
    where.domainId = domainId;
  }

  if (subdomainId) {
    where.id = subdomainId;
  }

  try {
    const [subdomains, total] = await Promise.all([
      prisma.subdomain.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          domain: {
            select: { name: true },
          },
        },
      }),
      prisma.subdomain.count({ where }),
    ]);

    return NextResponse.json({
      data: subdomains,
      meta: {
        hasMore: skip + subdomains.length < total,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
