import { NextResponse } from 'next/server';
import { getSessionUser } from '@/core/auth/authUtils';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { profileUpdateSchema } from '@/shared/validation/validation';
import { sanitizeError } from '@/lib/errors';
import { prisma } from '@/infra/db/prisma.client';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // Filter out null values to prevent Zod validation errors (treats null as undefined)
    const cleanedBody = Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v !== null)
    );
    
    // Validate input
    const validated = profileUpdateSchema.parse(cleanedBody);
    const { name, phone, dob, city, district, state, password } = validated;

    // Get authenticated user from session
    const user = await getSessionUser();

    if (!user || !user.candidateProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidateProfileId = user.candidateProfile.id;

    // Use transaction to ensure atomicity (both updates succeed or fail together)
    await prisma.$transaction(async (tx) => {
      // 1. Prepare User table update
      const userUpdateData: Record<string, any> = {};
      if (name !== undefined) userUpdateData.name = name;
      if (phone !== undefined) userUpdateData.phone = phone;
      if (password) {
        userUpdateData.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: userUpdateData
        });
      }

      // 2. Prepare CandidateProfile table update
      // Only update fields that are explicitly defined in the request
      const profileUpdateData: Record<string, any> = {};

      // Handle fields: check original body for explicit null (to clear), otherwise use validated value
      if (body.dob === null) profileUpdateData.dob = null;
      else if (dob !== undefined) profileUpdateData.dob = dob ? new Date(dob) : null;

      if (body.city === null) profileUpdateData.city = null;
      else if (city !== undefined) profileUpdateData.city = city;

      if (body.district === null) profileUpdateData.district = null;
      else if (district !== undefined) profileUpdateData.district = district;

      if (body.state === null) profileUpdateData.state = null;
      else if (state !== undefined) profileUpdateData.state = state;

      if (Object.keys(profileUpdateData).length > 0) {
        await tx.candidateProfile.update({
          where: { id: candidateProfileId },
          data: profileUpdateData
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.format() },
        { status: 400 }
      );
    }
    console.error('[INTERNAL ERROR]', error);
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    );
  }
}
