import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma.client';

export async function POST(request: Request) {
  try {

    const body = await request.json();
    // Accept both 'name' and 'skillName' for compatibility
    const { candidateId, name, skillName, category } = body;
    const skillToUse = name || skillName;

    if (!candidateId || !skillToUse) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if skill already exists, if not create it

    let skill = await prisma.skill.findFirst({
      where: { name: { equals: skillToUse, mode: 'insensitive' } }
    });

    if (!skill) {
      skill = await prisma.skill.create({
        data: {
          name: skillToUse,
          category: category || null,
        }
      });
    }

    // Get candidate profile to connect skill
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: { skills: true }
    });

    // Check if candidate already has this skill
    if (candidate?.skills.some(s => s.id === skill.id)) {
      return NextResponse.json({ error: 'Skill already added' }, { status: 400 });
    }

    // Create CandidateSkill entry
    await prisma.candidateSkill.create({
      data: {
        candidateId,
        skillId: skill.id
      }
    });

    return NextResponse.json({ success: true, skill }, { status: 201 });
  } catch (error) {
    console.error('Error adding skill:', error);
    return NextResponse.json({ error: 'Failed to add skill' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    const candidateId = searchParams.get('candidateId');

    if (!skillId || !candidateId) {
      return NextResponse.json({ error: 'Skill ID and Candidate ID required' }, { status: 400 });
    }

    // Disconnect skill from candidate
    await prisma.candidateProfile.update({
      where: { id: candidateId },
      data: {
        skills: {
          disconnect: { id: skillId }
        }
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error removing skill:', error);
    return NextResponse.json({ error: 'Failed to remove skill' }, { status: 500 });
  }
}
