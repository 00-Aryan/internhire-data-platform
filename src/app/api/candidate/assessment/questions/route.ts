import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';
import { getSessionUser } from '@/core/auth/authUtils';
import { canCandidateTakeAssessments } from '@/core/subscription/subscriptionUtils.legacy';

/**
 * Exact shape of rows returned by the raw SQL query below.
 * This MUST match the SELECT clause exactly.
 */
type RawMCQQuestionRow = {
  id: string;
  questionTypeId: string;
  difficultyLevel: string;
  timeLimitSeconds: number | null;
  allowedTimeSeconds: number | null;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
};

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user || !user.candidateProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Subscription Check
    const hasAccess = canCandidateTakeAssessments(
      user.candidateProfile.assessmentsSubscriptionExpiry,
      user.email
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Active Assessment Subscription required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subdomainId = searchParams.get('subdomainId');

    if (!subdomainId) {
      return NextResponse.json(
        { error: 'subdomainId is required' },
        { status: 400 }
      );
    }

    // Fetch all random questions for the subdomain using raw SQL (Postgres)
    const questions = await prisma.$queryRaw<RawMCQQuestionRow[]>`
      SELECT
        q."id",
        q."questionTypeId",
        q."difficultyLevel",
        q."timeLimitSeconds",
        qt."allowedTimeSeconds",
        ms."questionText",
        ms."option1",
        ms."option2",
        ms."option3",
        ms."option4"
      FROM "Question" q
      JOIN "QuestionType" qt ON q."questionTypeId" = qt."id"
      JOIN "MCQStandard" ms ON q."id" = ms."questionId"
      WHERE q."subdomainId" = ${subdomainId}
        AND q."isActive" = true
        AND qt."name" = 'MCQStandard'
      ORDER BY RANDOM()
    `;

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found for this assessment' },
        { status: 404 }
      );
    }

    // Use per-question timer if present, else fallback to questionType.allowedTimeSeconds
    const sanitizedQuestions = questions.map((q) => {
      const options = [
        { id: 1, text: q.option1 },
        { id: 2, text: q.option2 },
        { id: 3, text: q.option3 },
        { id: 4, text: q.option4 },
      ];

      // Fisher–Yates shuffle
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return {
        id: q.id,
        text: q.questionText,
        options,
        difficulty: q.difficultyLevel,
        type: 'MCQStandard' as const,
        questionTypeId: q.questionTypeId,
        allowedTimeSeconds:
          q.timeLimitSeconds ?? q.allowedTimeSeconds ?? null,
      };
    });

    return NextResponse.json({ questions: sanitizedQuestions });

  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
