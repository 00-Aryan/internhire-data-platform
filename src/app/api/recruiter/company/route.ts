import { NextResponse } from 'next/server';
import { EstablishmentType } from '@prisma/client';
import { cookies } from 'next/headers';
import { prisma } from '@/infra/db/prisma.client';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      type,
      website,
      phone,
      email,
      cin,
      gst,
      address,
      city,
      district,
      state
    } = body;

    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user')?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a recruiter and get establishment ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        recruiterProfile: true
      }
    });

    if (!user || !user.recruiterProfile) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const establishmentId = user.recruiterProfile.establishmentId;

    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: {
        name,
        type: type as EstablishmentType,
        website,
        phone,
        email,
        cin,
        gst,
        address,
        city,
        district,
        state
      }
    });

    return NextResponse.json({ success: true, establishment: updatedEstablishment });

  } catch (error: unknown) {
    console.error("Error updating company profile:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: "Update failed", details: errorMessage }, { status: 500 });
  }
}
