import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';
import { getSessionUser } from '@/core/auth/authUtils';

// Returns: { stage: 'start' | 'resume' | 'completed' }
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

    // Check if submitted (for now, check if /submit was called by looking for a submission log or similar)
    // If you have a table for submissions, check it here. For now, we'll just check if all questions are answered.

    // Count answers for this candidate and subdomain
    const answersCount = await prisma.assessmentAnswer.count({
      where: {
        candidateId: user.candidateProfile.id,
        subdomainId,
      },
    });

    // Optionally, check if submitted (if you add a submission log/table, check here)
    // For now, treat as completed if answersCount === total questions for subdomain
    const totalQuestions = await prisma.question.count({
      where: {
        subdomainId,
        isActive: true,
        questionType: { name: 'MCQStandard' },
      },
    });

    // If you add a submission log/table, check for submission here and set stage = 'completed' if found
    // For now, treat as completed if answersCount === totalQuestions and answersCount > 0
    let stage: 'start' | 'resume' | 'completed' = 'start';
    if (answersCount === 0) {
      stage = 'start';
    } else if (answersCount > 0 && answersCount < totalQuestions) {
      stage = 'resume';
    } else if (answersCount === totalQuestions && totalQuestions > 0) {
      // Optionally, check for submission log here
      stage = 'completed';
    }

    return NextResponse.json({ stage });
  } catch (error) {
    console.error('Error detecting assessment stage:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
