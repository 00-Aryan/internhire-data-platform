import { cookies } from 'next/headers';
import { prisma } from '@/infra/db/prisma.client';

export type ActiveRole = 'CANDIDATE' | 'RECRUITER';

export async function getSessionUser() {
  const cookieStore = await cookies();

  const userId = cookieStore.get('auth_user')?.value;
  const role = cookieStore.get('auth_role')?.value as ActiveRole | undefined;

  if (!userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        recruiterProfile: {
          include: {
            establishment: true,
          },
        },
        candidateProfile: true,
      },
    });

    if (!user) {
      return null;
    }

    /**
     * SAFETY CHECKS
     * Never trust cookies blindly.
     * If role cookie is invalid or mismatched, fix it safely.
     */
    let activeRole: ActiveRole | null = null;

    if (role === 'RECRUITER' && user.recruiterProfile) {
      activeRole = 'RECRUITER';
    } else if (role === 'CANDIDATE' && user.candidateProfile) {
      activeRole = 'CANDIDATE';
    } else {
      // Fallback (should rarely happen)
      if (user.recruiterProfile) {
        activeRole = 'RECRUITER';
      } else if (user.candidateProfile) {
        activeRole = 'CANDIDATE';
      }
    }

    return {
      ...user,
      activeRole, //  single source of truth going forward
    };
  } catch (error) {
    console.error('Error fetching session user:', error);
    return null;
  }
}
