import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/core/auth/authUtils';
import { prisma } from '@/infra/db/prisma.client';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.candidateProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subdomainId, questionId, questionTypeId, selectedOption } = body;
    const candidateId = user.candidateProfile.id;

    if (!subdomainId || !questionId || !questionTypeId || selectedOption === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use upsert to handle both new answers and updates to existing answers (Fixes 409 Conflict)
    await prisma.assessmentAnswer.upsert({
      where: {
        candidateId_questionId_subdomainId: {
          candidateId,
          questionId,
          subdomainId
        }
      },
      create: {
        candidateId,
        questionId,
        subdomainId,
        questionTypeId,
        mcqStandardAnswer: {
          create: {
            selectedOption: Number(selectedOption)
          }
        }
      },
      update: {
        mcqStandardAnswer: {
          upsert: {
            create: {
              selectedOption: Number(selectedOption)
            },
            update: {
              selectedOption: Number(selectedOption)
            }
          }
        }
      }
    });

    // --- NEW: Calculate and Update SubdomainRawScore immediately ---
    // 1. Fetch all active questions for this subdomain
    const questions = await prisma.question.findMany({
      where: { subdomainId, isActive: true },
      include: { mcqStandard: true },
    });

    // 2. Fetch all answers for this candidate in this subdomain
    const allAnswers = await prisma.assessmentAnswer.findMany({
      where: { candidateId, subdomainId },
      include: { mcqStandardAnswer: true }
    });

    // 3. Calculate Score
    let correctCount = 0;
    const totalQuestions = questions.length;
    const answerMap = new Map<string, number>();
    
    allAnswers.forEach((ans) => {
      if (ans.mcqStandardAnswer) {
        answerMap.set(ans.questionId, ans.mcqStandardAnswer.selectedOption);
      }
    });

    for (const q of questions) {
      if (q.mcqStandard && answerMap.get(q.id) === q.mcqStandard.correctOption) {
        correctCount++;
      }
    }

    const rawScore = totalQuestions > 0 
      ? Math.round((correctCount / totalQuestions) * 100) 
      : 0;

    // 4. Update SubdomainRawScore
    await prisma.subdomainRawScore.upsert({
      where: { candidateId_subdomainId: { candidateId, subdomainId } },
      create: { candidateId, subdomainId, rawScore, timestamp: new Date() },
      update: { rawScore, timestamp: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving answer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}