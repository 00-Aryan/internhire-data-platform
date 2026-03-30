
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/core/auth/authUtils';
import { prisma } from '@/infra/db/prisma.client';

// This endpoint calculates the score and saves it to SubdomainRawScore.
export async function POST(request: NextRequest) {
  console.log('🔵 [API] Assessment Submit Triggered'); // Debug Log

  try {
    const user = await getSessionUser();
    if (!user || !user.candidateProfile) {
      console.warn('❌ [API] Unauthorized or no candidate profile');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidateId = user.candidateProfile.id;
    const body = await request.json();
    let { subdomainId, answers } = body; // Changed to 'let' to allow updates

    const answerCount = Object.keys(answers || {}).length;
    console.log(`📦 [API] Payload - Candidate: ${candidateId}, Subdomain: ${subdomainId}, Answers in Body: ${answerCount}`);

    if (!subdomainId) {
      return NextResponse.json({ error: 'subdomainId is required' }, { status: 400 });
    }

    // 1. Fetch questions to grade against
    const questions = await prisma.question.findMany({
      where: { subdomainId, isActive: true },
      include: { mcqStandard: true },
    });

    // --- FIX: Fetch answers from DB if missing in body ---
    if (answerCount === 0) {
      console.log('⚠️ [API] No answers in payload. Attempting to fetch saved answers from DB...');
      
      const dbAnswers = await prisma.assessmentAnswer.findMany({
        where: { 
          candidateId, 
          subdomainId 
        },
        include: {
          mcqStandardAnswer: true
        }
      });
      
      if (dbAnswers.length > 0) {
        answers = {};
        dbAnswers.forEach((ans: any) => {
          if (ans.mcqStandardAnswer) {
            answers[ans.questionId] = ans.mcqStandardAnswer.selectedOption; 
          }
        });
        console.log(` [API] Recovered ${Object.keys(answers).length} answers from DB.`);
      }
     
      if (!answers || Object.keys(answers).length === 0) {
         console.warn('❌ [API] No answers found in DB or Body. Score will be 0.');
      }
    }

    console.log(`❓ [API] Found ${questions.length} active questions for this subdomain`);

    // 2. Calculate Score
    let correctCount = 0;
    const totalQuestions = questions.length;

    if (answers && totalQuestions > 0) {
      for (const q of questions) {
        // Assuming answers is { [questionId]: selectedOptionInt }
        // and mcqStandard.correctOption is the correct integer index
        if (q.mcqStandard && answers[q.id] === q.mcqStandard.correctOption) {
          correctCount++;
        }
      }
    }

    // 3. Normalize to 0-100 scale
    const rawScore = totalQuestions > 0 
      ? Math.round((correctCount / totalQuestions) * 100) 
      : 0;

    console.log(`🧮 [API] Score Calculated: ${rawScore} (${correctCount}/${totalQuestions} correct)`);

    // 4. Save to Database (Overwrite previous attempt)
    await prisma.$transaction(async (tx) => {
      const deleted = await tx.subdomainRawScore.deleteMany({
        where: {
          candidateId: candidateId,
          subdomainId: subdomainId
        }
      });
      console.log(`🗑️ [API] Deleted ${deleted.count} previous score(s)`);

      await tx.subdomainRawScore.create({
        data: {
          candidateId: candidateId,
          subdomainId: subdomainId,
          rawScore: rawScore
        }
      });
      console.log(`💾 [API] Saved new score: ${rawScore}`);
    });

    return NextResponse.json({ success: true, score: rawScore });
  } catch (error) {
    console.error('❌ [API] Assessment submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
