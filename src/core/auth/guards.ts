import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/infra/db/prisma.client';

interface RequireAuthOptions {
  role?: 'CANDIDATE' | 'RECRUITER';
}

export async function requireAuth(options?: RequireAuthOptions) {
  //  FIX: cookies() is async in this codebase
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user')?.value;

  if (!userId) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      candidateProfile: true,
      recruiterProfile: true,
    },
  });

  if (!user) {
    redirect('/auth/login');
  }

  if (options?.role === 'CANDIDATE' && !user.candidateProfile) {
    redirect('/auth/login');
  }

  if (options?.role === 'RECRUITER' && !user.recruiterProfile) {
    redirect('/auth/login');
  }

  return user;
}
