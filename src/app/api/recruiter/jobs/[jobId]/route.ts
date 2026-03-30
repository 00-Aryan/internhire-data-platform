import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/infra/db/prisma.client';
import { checkCapability } from '@/core/profile-readiness';
import type { UserProfileData } from '@/core/profile-readiness';
import { z } from 'zod';

const updateRecruiterProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  designation: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  profileLink: z.union([z.string(), z.literal(''), z.null()]).optional().transform(v => v === '' ? null : v),
  password: z.string().optional(),
  establishment: z.object({
    type: z.enum(['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'INSTITUTE', 'COMPANY_PVT_LTD', 'COMPANY_LLP', 'PROPRIETORSHIP', 'FREELANCER']),
    name: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    district: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    establishmentPhone: z.string().nullable().optional(),
    establishmentEmail: z.string().nullable().optional(),
    cin: z.string().nullable().optional(),
    gst: z.string().nullable().optional(),
  }).optional(),
});

export async function GET() {
  try {
    // 1. Auth
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch user + recruiter profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        recruiterProfile: {
          include: {
            establishment: true,
          },
        },
      },
    });

    if (!user || !user.recruiterProfile) {
      return NextResponse.json(
        { error: 'Recruiter profile not found' },
        { status: 404 }
      );
    }

    const recruiter = user.recruiterProfile;

    // 3. Build UserProfileData for readiness check
    const profileData: UserProfileData = {
      userId: user.id,
      role: 'RECRUITER',
      recruiterProfile: {
        id: recruiter.id,
        department: recruiter.department,
        designation: recruiter.designation,
        profileLink: recruiter.profileLink ?? null,
        user: {
          firstName: user.name?.split(' ')[0] ?? null,
          lastName: user.name?.split(' ').slice(1).join(' ') || null,
        },
        establishment: {
          id: recruiter.establishment.id,
          name: recruiter.establishment.name ?? '',
          email: recruiter.establishment.email ?? null,
          website: recruiter.establishment.website ?? null,
          phone: recruiter.establishment.phone ?? null, 
          type: recruiter.establishment.type ?? null,
  address: recruiter.establishment.address ?? null,
  city: recruiter.establishment.city ?? null,
  district: recruiter.establishment.district ?? null,
  state: recruiter.establishment.state ?? null,
        },

        subscriptionExpiry: recruiter.subscriptionExpiry,
      },
    };

    // 4. Capability check (publish job)
    const readiness = await checkCapability({
      user: profileData,
      capability: 'post_job',
    });

    // 5. Return profile + readiness (non-blocking)
    return NextResponse.json({
      recruiterProfile: recruiter,
      readiness: {
        canPostJob: readiness.allowed,
        missing: readiness.missing ?? [],
        reason: readiness.reason ?? null,
      },
    });
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error';

    return NextResponse.json(
      { error: 'Failed to fetch profile', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // 1. Validation Layer
    const validation = updateRecruiterProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 });
    }

    // Use validated data for type safety
    const { name, phone, designation, department, profileLink, establishment, password } = validation.data;

    // Auth
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { recruiterProfile: true },
    });

    if (!user || !user.recruiterProfile) {
      return NextResponse.json(
        { error: 'Recruiter profile not found' },
        { status: 404 }
      );
    }

    // Update establishment
    if (establishment) {
      await prisma.establishment.update({
        where: { id: user.recruiterProfile.establishmentId },
        data: {
          type: establishment.type,
          name: establishment.name,
          city: establishment.city,
          district: establishment.district,
          state: establishment.state,
          address: establishment.address,
          website: establishment.website,
          phone: establishment.establishmentPhone,
          email: establishment.establishmentEmail,
          cin: establishment.cin,
          gst: establishment.gst,
        },
      });
    }

    const userUpdateData: {
      name?: string;
      phone?: string;
      password?: string;
      recruiterProfile?: unknown;
    } = {
      name,
    };

    if (phone !== undefined && phone !== user.phone) {
      userUpdateData.phone = phone;
    }

    userUpdateData.recruiterProfile = {
      update: {
        designation,
        department,
        profileLink,
      },
    };

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      userUpdateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userUpdateData as Record<string, unknown>,
      include: {
        recruiterProfile: {
          include: { establishment: true },
        },
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: unknown) {
    console.error(error);

    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Phone number is already in use.' },
        { status: 409 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error';

    return NextResponse.json(
      { error: 'Update failed', details: errorMessage },
      { status: 500 }
    );
  }
}