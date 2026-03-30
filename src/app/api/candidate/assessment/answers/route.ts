import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';
import { getSessionUser } from '@/core/auth/authUtils';

// Returns all answers for the current candidate for a given subdomain
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.candidateProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subdomainId = searchParams.get('subdomainId');
    if (!subdomainId) {
      return NextResponse.json({ error: 'subdomainId is required' }, { status: 400 });
    }

    // Fetch all answers for this candidate and subdomain
    const answers = await prisma.assessmentAnswer.findMany({
      where: {
        candidateId: user.candidateProfile.id,
        subdomainId,
      },
      select: {
        questionId: true,
        mcqStandardAnswer: {
          select: { selectedOption: true },
        },
      },
    });

    // Map to questionId -> selectedOption
    const answerMap: Record<string, number> = {};
    for (const ans of answers) {
      if (ans.mcqStandardAnswer) {
        answerMap[ans.questionId] = ans.mcqStandardAnswer.selectedOption;
      }
    }

    return NextResponse.json({ answers: answerMap });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
