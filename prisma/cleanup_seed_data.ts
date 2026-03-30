import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting cleanup of seeded data...');

  const testEmails = [
    'testing.internhire@gmail.com',
    'test_candidate_1@example.com',
    'test_candidate_2@example.com',
    'test_candidate_3@example.com',
    'test_candidate_4@example.com',
    'test_candidate_5@example.com',
  ];

  // 1. Find Users to delete
  const users = await prisma.user.findMany({
    where: { email: { in: testEmails } },
    include: {
      candidateProfile: true,
      recruiterProfile: true,
    }
  });

  const userIds = users.map(u => u.id);
  const candidateIds = users.map(u => u.candidateProfile?.id).filter(Boolean) as string[];
  const recruiterIds = users.map(u => u.recruiterProfile?.id).filter(Boolean) as string[];

  console.log(`Found ${users.length} test users to delete.`);

  // 2. Delete Candidate Related Data
  if (candidateIds.length > 0) {
    console.log('Deleting candidate scores and answers...');
    // Scores
    await prisma.subdomainRawScore.deleteMany({ where: { candidateId: { in: candidateIds } } });
    await prisma.subdomainDerivedScore.deleteMany({ where: { candidateId: { in: candidateIds } } });
    await prisma.domainScore.deleteMany({ where: { candidateId: { in: candidateIds } } });
    await prisma.globalScore.deleteMany({ where: { candidateId: { in: candidateIds } } });
    
    // Answers
    await prisma.assessmentAnswer.deleteMany({ where: { candidateId: { in: candidateIds } } });
    
    // Applications
    console.log('Deleting applications...');
    await prisma.application.deleteMany({ where: { candidateId: { in: candidateIds } } });

    // Profile Details
    console.log('Deleting candidate profile details...');
    await prisma.candidateSkill.deleteMany({ where: { candidateId: { in: candidateIds } } });
    await prisma.tenthEducation.deleteMany({ where: { candidateId: { in: candidateIds } } });
    await prisma.twelfthEducation.deleteMany({ where: { candidateId: { in: candidateIds } } });
    await prisma.uGEducation.deleteMany({ where: { candidateId: { in: candidateIds } } });
    await prisma.pGEducation.deleteMany({ where: { candidateId: { in: candidateIds } } });
    await prisma.experience.deleteMany({ where: { candidateId: { in: candidateIds } } });
    await prisma.candidateProfile.deleteMany({ where: { id: { in: candidateIds } } });
  }

  // 3. Delete Recruiter Related Data
  if (recruiterIds.length > 0) {
    console.log('Deleting recruiter jobs and profile...');
    // Find jobs posted by these recruiters
    const jobs = await prisma.jobListing.findMany({ where: { recruiterId: { in: recruiterIds } } });
    const jobIds = jobs.map(j => j.id);

    // Delete job dependencies
    await prisma.application.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.jobSkill.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.chat.deleteMany({ where: { jobId: { in: jobIds } } });
    
    // Delete jobs
    await prisma.jobListing.deleteMany({ where: { id: { in: jobIds } } });

    // Delete profile
    await prisma.recruiterProfile.deleteMany({ where: { id: { in: recruiterIds } } });
  }

  // 4. Delete Users
  console.log('Deleting users...');
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  // 5. Delete Establishment
  console.log('Deleting test establishment...');
  await prisma.establishment.deleteMany({ where: { name: 'Test Company Pvt Ltd' } });

  // 6. Delete Assessment Structure (Domains, Subdomains, Questions)
  console.log('Deleting assessment structure (Questions, Subdomains, Domains)...');
  const domainsToDelete = ['Technical Skills', 'Soft Skills'];
  
  const domains = await prisma.domain.findMany({
    where: { name: { in: domainsToDelete } },
    include: { subdomains: { include: { questions: true } } }
  });

  for (const domain of domains) {
    // Delete Domain Scores (for any user linked to this domain)
    await prisma.domainScore.deleteMany({ where: { domainId: domain.id } });

    for (const subdomain of domain.subdomains) {
      // Delete Subdomain Scores (for any user)
      await prisma.subdomainRawScore.deleteMany({ where: { subdomainId: subdomain.id } });
      await prisma.subdomainDerivedScore.deleteMany({ where: { subdomainId: subdomain.id } });

      const questionIds = subdomain.questions.map(q => q.id);
      if (questionIds.length > 0) {
        await prisma.assessmentAnswer.deleteMany({ where: { questionId: { in: questionIds } } });
        await prisma.mCQStandard.deleteMany({ where: { questionId: { in: questionIds } } });
        await prisma.question.deleteMany({ where: { id: { in: questionIds } } });
      }
    }
    await prisma.subdomain.deleteMany({ where: { domainId: domain.id } });
  }
  await prisma.domain.deleteMany({ where: { id: { in: domains.map(d => d.id) } } });

  console.log(' Cleanup complete. Test users and their data have been removed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });