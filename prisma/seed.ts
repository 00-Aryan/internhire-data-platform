import { PrismaClient, JobType, WorkMode, JobStatus, ApplicationStatus } from '@prisma/client'
import type { CandidateProfile } from '@prisma/client'
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

async function main() {
  // ...existing code...
    // ...existing code...
  console.log('🌱 Starting seeding for Scoring ETL...')

  // 1. Create Domains & Subdomains
  // We use upsert to ensure they exist without duplicating
  const techDomain = await prisma.domain.upsert({
    where: { name: 'Technical Skills' },
    update: {},
    create: {
      name: 'Technical Skills',
      subdomains: {
        create: [
          { name: 'Algorithms', weightInDomain: 0.6, maxScore: 100 },
          { name: 'System Design', weightInDomain: 0.4, maxScore: 100 }
        ]
      }
    },
    include: { subdomains: true }
  })

  // Ensure subdomains exist if domain was already present
  const techSubCount = await prisma.subdomain.count({ where: { domainId: techDomain.id } });
  if (techSubCount === 0) {
    await prisma.subdomain.createMany({
      data: [
        { name: 'Algorithms', weightInDomain: 0.6, domainId: techDomain.id, maxScore: 100 },
        { name: 'System Design', weightInDomain: 0.4, domainId: techDomain.id, maxScore: 100 }
      ]
    });
  }

  const softDomain = await prisma.domain.upsert({
    where: { name: 'Soft Skills' },
    update: {},
    create: {
      name: 'Soft Skills',
      subdomains: {
        create: [
          { name: 'Communication', weightInDomain: 0.5, maxScore: 100 },
          { name: 'Teamwork', weightInDomain: 0.5, maxScore: 100 }
        ]
      }
    },
    include: { subdomains: true }
  })

  const softSubCount = await prisma.subdomain.count({ where: { domainId: softDomain.id } });
  if (softSubCount === 0) {
    await prisma.subdomain.createMany({
      data: [
        { name: 'Communication', weightInDomain: 0.5, domainId: softDomain.id, maxScore: 100 },
        { name: 'Teamwork', weightInDomain: 0.5, domainId: softDomain.id, maxScore: 100 }
      ]
    });
  }

  const allSubdomains = await prisma.subdomain.findMany();
  console.log(` Domains setup: ${techDomain.name}, ${softDomain.name}`);

  // 1b. Add questions for 2nd and 3rd subdomains
  if (allSubdomains.length >= 3) {
    // Get or create a QuestionType for MCQStandard
    let mcqType = await prisma.questionType.findFirst({ where: { name: 'MCQStandard' } });
    if (!mcqType) {
      mcqType = await prisma.questionType.create({
        data: { name: 'MCQStandard', allowedTimeSeconds: 60 }
      });
    }

    // Helper to get domainId for subdomain
    const getDomainId = (subdomainId: string) => {
      const sub = allSubdomains.find(s => s.id === subdomainId);
      return sub ? sub.domainId : '';
    };

    // 2nd subdomain
    const sub2 = allSubdomains[1];
    // Q1
    let q1 = await prisma.question.create({
      data: {
        domainId: getDomainId(sub2.id),
        subdomainId: sub2.id,
        questionTypeId: mcqType.id,
        difficultyLevel: 'EASY',
        isActive: true,
        timeLimitSeconds: 60
      }
    });
    await prisma.mCQStandard.create({
      data: {
        questionId: q1.id,
        questionText: 'What is the main goal of system design?',
        option1: 'To create scalable and maintainable systems',
        option2: 'To write as much code as possible',
        option3: 'To avoid documentation',
        option4: 'To increase system cost',
        correctOption: 1
      }
    });
    // Q2
    let q2 = await prisma.question.create({
      data: {
        domainId: getDomainId(sub2.id),
        subdomainId: sub2.id,
        questionTypeId: mcqType.id,
        difficultyLevel: 'MEDIUM',
        isActive: true,
        timeLimitSeconds: 60
      }
    });
    await prisma.mCQStandard.create({
      data: {
        questionId: q2.id,
        questionText: 'Which of these is a common system design pattern?',
        option1: 'Singleton',
        option2: 'Bubble Sort',
        option3: 'Recursion',
        option4: 'Brute Force',
        correctOption: 1
      }
    });

    // 3rd subdomain
    const sub3 = allSubdomains[2];
    // Q3
    let q3 = await prisma.question.create({
      data: {
        domainId: getDomainId(sub3.id),
        subdomainId: sub3.id,
        questionTypeId: mcqType.id,
        difficultyLevel: 'EASY',
        isActive: true,
        timeLimitSeconds: 60
      }
    });
    await prisma.mCQStandard.create({
      data: {
        questionId: q3.id,
        questionText: 'What is the most important aspect of effective communication?',
        option1: 'Clarity',
        option2: 'Volume',
        option3: 'Speed',
        option4: 'Accent',
        correctOption: 1
      }
    });
    // Q4
    let q4 = await prisma.question.create({
      data: {
        domainId: getDomainId(sub3.id),
        subdomainId: sub3.id,
        questionTypeId: mcqType.id,
        difficultyLevel: 'MEDIUM',
        isActive: true,
        timeLimitSeconds: 60
      }
    });
    await prisma.mCQStandard.create({
      data: {
        questionId: q4.id,
        questionText: 'Which is NOT a barrier to communication?',
        option1: 'Noise',
        option2: 'Clarity',
        option3: 'Language differences',
        option4: 'Distractions',
        correctOption: 2
      }
    });
    console.log(' Added MCQStandard questions for subdomains 2 and 3');
  }

  // 2. Create 1 Recruiter & Establishment
  console.log('Creating 1 Recruiter and Establishment...')
  const recruiterEmail = 'testing.internhire@gmail.com';
  const recruiterPassword = await bcrypt.hash('DanDaDan@360%', 10);
  // Create Establishment
  const establishment = await prisma.establishment.create({
    data: {
      name: 'Test Company Pvt Ltd',
      type: 'COMPANY_PVT_LTD',
      city: 'Delhi',
      state: 'Delhi',
      address: '123, Test Street',
      phone: '9999900000',
      email: 'contact@testcompany.com'
    }
  });
  // Create User + RecruiterProfile
  const recruiterUser = await prisma.user.upsert({
    where: { email: recruiterEmail },
    update: {
      password: recruiterPassword,
      isVerified: true,
      emailVerified: new Date(),
    },
    create: {
      email: recruiterEmail,
      phone: '8888800000',
      password: recruiterPassword,
      name: 'Test Recruiter',
      isVerified: true,
      emailVerified: new Date(),
      recruiterProfile: {
        create: {
          department: 'HR',
          designation: 'Recruiter',
          establishmentId: establishment.id
        }
      }
    },
    include: { recruiterProfile: true }
  });

  // 2. Create 1 Candidate
  console.log('Creating 1 Candidate...')
  const candidates: CandidateProfile[] = []
  const hashedPassword = await bcrypt.hash('password123', 10);

  for (let i = 1; i <= 1; i++) {
    const email = `test_candidate_${i}@example.com`
    // Create User + CandidateProfile
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        isVerified: true,
        emailVerified: new Date(),
      },
      create: {
        email,
        phone: `999990000${i}`,
        password: hashedPassword, 
        name: `Test Candidate ${i}`,
        isVerified: true,
        emailVerified: new Date(),
        candidateProfile: {
          create: {
            city: 'Test City',
          }
        }
      },
      include: { candidateProfile: true }
    })
    if (user.candidateProfile) {
      candidates.push(user.candidateProfile)
    }
  }

  // 3. Assign Raw Scores
  console.log('Assigning Raw Scores...')

  // Cleanup old scores for these candidates to avoid duplicates
  const candidateIds = candidates.map(c => c.id);
  try {
    await prisma.subdomainRawScore.deleteMany({
      where: { candidateId: { in: candidateIds } }
    });
  } catch (e) {
    // Ignore if table doesn't exist or is empty
  }

  for (const candidate of candidates) {
    // Bias scores: Candidate 1 gets high scores, Candidate 5 gets low scores
    // This helps verify ranking logic
    const performanceBias = (5 - candidates.indexOf(candidate)) * 10; // 50, 40, 30...

    for (const sub of allSubdomains) {
      const randomVar = Math.random() * 20;
      let rawScore = Math.floor(30 + performanceBias + randomVar);
      if (rawScore > 100) rawScore = 100;
      if (rawScore < 0) rawScore = 0;

      await prisma.subdomainRawScore.create({
        data: {
          candidateId: candidate.id,
          subdomainId: sub.id,
          rawScore: rawScore
        }
      })
    }
  }

  // 3b. Add sample internship jobs
  console.log('Creating sample internship jobs...');
  const recruiter = recruiterUser.recruiterProfile;
  if (recruiter) {
    const internshipJobs = [
      // ...existing 8 jobs...
      {
        title: 'Software Development Intern',
        description: 'Work on real-world web applications using React and Node.js.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.HYBRID,
        domain: 'Technical Skills',
        locationCity: 'Bangalore',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 15000,
        status: JobStatus.APPROVED
      },
      {
        title: 'Marketing Intern',
        description: 'Assist in digital marketing campaigns and social media management.',
        type: JobType.INTERNSHIP_PART_TIME,
        workMode: WorkMode.REMOTE_ANYWHERE,
        domain: 'Soft Skills',
        locationCity: 'Remote',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: false,
        status: JobStatus.APPROVED
      },
      {
        title: 'Data Analyst Intern',
        description: 'Analyze datasets and generate business insights.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.IN_OFFICE,
        domain: 'Technical Skills',
        locationCity: 'Mumbai',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 12000,
        status: JobStatus.APPROVED
      },
      {
        title: 'UI/UX Design Intern',
        description: 'Assist in designing user interfaces and user experiences for web and mobile apps.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.REMOTE_ANYWHERE,
        domain: 'Technical Skills',
        locationCity: 'Chennai',
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 10000,
        status: JobStatus.APPROVED
      },
      {
        title: 'Content Writing Intern',
        description: 'Create engaging content for blogs, websites, and social media.',
        type: JobType.INTERNSHIP_PART_TIME,
        workMode: WorkMode.REMOTE_ANYWHERE,
        domain: 'Soft Skills',
        locationCity: 'Remote',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: false,
        status: JobStatus.APPROVED
      },
      {
        title: 'Business Development Intern',
        description: 'Support the business development team in lead generation and client outreach.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.IN_OFFICE,
        domain: 'Soft Skills',
        locationCity: 'Pune',
        deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 8000,
        status: JobStatus.APPROVED
      },
      {
        title: 'Operations Intern',
        description: 'Assist in daily operations and process optimization.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.IN_OFFICE,
        domain: 'Technical Skills',
        locationCity: 'Hyderabad',
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 9000,
        status: JobStatus.APPROVED
      },
      {
        title: 'Graphic Design Intern',
        description: 'Work on branding, marketing materials, and digital graphics.',
        type: JobType.INTERNSHIP_PART_TIME,
        workMode: WorkMode.HYBRID,
        domain: 'Technical Skills',
        locationCity: 'Kolkata',
        deadline: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: false,
        status: JobStatus.APPROVED
      },
      // 12 more internships for broader testing
      {
        title: 'Finance Intern',
        description: 'Assist with financial analysis and reporting.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.IN_OFFICE,
        domain: 'Technical Skills',
        locationCity: 'Ahmedabad',
        deadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 11000,
        status: JobStatus.APPROVED
      },
      {
        title: 'HR Intern',
        description: 'Support HR operations and recruitment processes.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.IN_OFFICE,
        domain: 'Soft Skills',
        locationCity: 'Delhi',
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: false,
        status: JobStatus.APPROVED
      },
      {
        title: 'Sales Intern',
        description: 'Assist in sales outreach and CRM management.',
        type: JobType.INTERNSHIP_PART_TIME,
        workMode: WorkMode.HYBRID,
        domain: 'Soft Skills',
        locationCity: 'Gurgaon',
        deadline: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 7000,
        status: JobStatus.APPROVED
      },
      {
        title: 'Product Management Intern',
        description: 'Work with product managers to define features and roadmap.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.REMOTE_ANYWHERE,
        domain: 'Technical Skills',
        locationCity: 'Remote',
        deadline: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 13000,
        status: JobStatus.APPROVED
      },
      {
        title: 'Legal Intern',
        description: 'Assist in legal research and documentation.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.IN_OFFICE,
        domain: 'Technical Skills',
        locationCity: 'Jaipur',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: false,
        status: JobStatus.APPROVED
      },
      {
        title: 'Customer Support Intern',
        description: 'Provide support to customers via chat and email.',
        type: JobType.INTERNSHIP_PART_TIME,
        workMode: WorkMode.REMOTE_ANYWHERE,
        domain: 'Soft Skills',
        locationCity: 'Remote',
        deadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: false,
        status: JobStatus.APPROVED
      },
      {
        title: 'Event Management Intern',
        description: 'Help organize and manage corporate events.',
        type: JobType.INTERNSHIP_PART_TIME,
        workMode: WorkMode.IN_OFFICE,
        domain: 'Soft Skills',
        locationCity: 'Bhopal',
        deadline: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 6000,
        status: JobStatus.APPROVED
      },
      {
        title: 'Backend Developer Intern',
        description: 'Work on server-side logic and database management.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.HYBRID,
        domain: 'Technical Skills',
        locationCity: 'Noida',
        deadline: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 14000,
        status: JobStatus.APPROVED
      },
      {
        title: 'Front-End Developer Intern',
        description: 'Develop user-facing features using React.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.REMOTE_ANYWHERE,
        domain: 'Technical Skills',
        locationCity: 'Remote',
        deadline: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 12500,
        status: JobStatus.APPROVED
      },
      {
        title: 'QA Intern',
        description: 'Test web and mobile applications for bugs and usability.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.IN_OFFICE,
        domain: 'Technical Skills',
        locationCity: 'Lucknow',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: false,
        status: JobStatus.APPROVED
      },
      {
        title: 'Research Intern',
        description: 'Assist in academic and market research projects.',
        type: JobType.INTERNSHIP_PART_TIME,
        workMode: WorkMode.REMOTE_ANYWHERE,
        domain: 'Technical Skills',
        locationCity: 'Remote',
        deadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: false,
        status: JobStatus.APPROVED
      },
      {
        title: 'Cloud Engineering Intern',
        description: 'Work on cloud infrastructure and DevOps tasks.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.HYBRID,
        domain: 'Technical Skills',
        locationCity: 'Bangalore',
        deadline: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 16000,
        status: JobStatus.APPROVED
      },
      // Drafted Internships for UI Testing
      {
        title: 'Mobile App Dev Intern (Draft)',
        description: 'Draft: Working on Flutter applications.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.REMOTE_ANYWHERE,
        domain: 'Technical Skills',
        locationCity: 'Remote',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 12000,
        status: JobStatus.DRAFT
      },
      {
        title: 'SEO Specialist Intern (Draft)',
        description: 'Draft: Optimizing content for search engines.',
        type: JobType.INTERNSHIP_PART_TIME,
        workMode: WorkMode.REMOTE_ANYWHERE,
        domain: 'Soft Skills',
        locationCity: 'Remote',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: false,
        status: JobStatus.DRAFT
      },
      // Additional Posted Internships for UI Testing
      {
        title: 'Blockchain Developer Intern (Posted)',
        description: 'Posted: Smart contract development.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.REMOTE_ANYWHERE,
        domain: 'Technical Skills',
        locationCity: 'Remote',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 25000,
        status: JobStatus.APPROVED
      },
      {
        title: 'Cyber Security Analyst Intern (Draft)',
        description: 'Draft: Security auditing and penetration testing.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.IN_OFFICE,
        domain: 'Technical Skills',
        locationCity: 'Mumbai',
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 18000,
        status: JobStatus.DRAFT
      },
      {
        title: 'Game Developer Intern (Posted)',
        description: 'Posted: Unity 3D game development.',
        type: JobType.INTERNSHIP_FULL_TIME,
        workMode: WorkMode.HYBRID,
        domain: 'Technical Skills',
        locationCity: 'Bangalore',
        deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        recruiterId: recruiter.id,
        isPaid: true,
        stipendAmount: 20000,
        status: JobStatus.APPROVED
      }
    ];
    const createdJobs = [];
    for (const job of internshipJobs) {
      const createdJob = await prisma.jobListing.create({ data: job });
      createdJobs.push(createdJob);
    }
    console.log(' Internship jobs seeded:');
    internshipJobs.forEach((job, idx) => {
      console.log(`   - [${idx + 1}] ${job.title} (${job.locationCity})`);
    });

    // 3c. Create Job Applications
    console.log('Creating sample job applications...');
    const liveJobs = createdJobs.filter(j => j.status === 'APPROVED');

    // Apply candidates to the first live job
    if (liveJobs.length > 0 && candidates.length >= 3) {
      for (let i = 0; i < 3; i++) {
        await prisma.application.create({
          data: {
            jobId: liveJobs[0].id,
            candidateId: candidates[i].id,
            status: ApplicationStatus.APPLIED
          }
        });
      }
      console.log(`   - Applied 3 candidates to ${liveJobs[0].title}`);
    }

    // Apply candidates to the second live job
    if (liveJobs.length > 1 && candidates.length >= 5) {
      for (let i = 3; i < 5; i++) {
        await prisma.application.create({
          data: {
            jobId: liveJobs[1].id,
            candidateId: candidates[i].id,
            status: ApplicationStatus.APPLIED
          }
        });
      }
      console.log(`   - Applied 2 candidates to ${liveJobs[1].title}`);
    }
  } else {
    console.log('⚠️ No recruiter found to assign internship jobs.');
  }
  // 4. Create 1 MCQStandard Question
const mcqType = await prisma.questionType.upsert({
  where: { name: 'MCQStandard' },
  update: {},
  create: { name: 'MCQStandard' }
});


const firstSubdomain = await prisma.subdomain.findFirst();
if (firstSubdomain) {
  // Seed 6 MCQStandard questions (1 original + 5 more)
  const mcqQuestions = [
    {
      questionText: 'What is 2 + 2?',
      option1: '3',
      option2: '4',
      option3: '5',
      option4: '6',
      correctOption: 2,
      explanation: '2 + 2 equals 4.'
    },
    {
      questionText: 'What is the capital of France?',
      option1: 'Berlin',
      option2: 'London',
      option3: 'Paris',
      option4: 'Madrid',
      correctOption: 3,
      explanation: 'Paris is the capital of France.'
    },
    {
      questionText: 'Which planet is known as the Red Planet?',
      option1: 'Earth',
      option2: 'Mars',
      option3: 'Jupiter',
      option4: 'Saturn',
      correctOption: 2,
      explanation: 'Mars is known as the Red Planet.'
    },
    {
      questionText: 'What is the largest ocean on Earth?',
      option1: 'Atlantic Ocean',
      option2: 'Indian Ocean',
      option3: 'Arctic Ocean',
      option4: 'Pacific Ocean',
      correctOption: 4,
      explanation: 'Pacific Ocean is the largest.'
    },
    {
      questionText: 'Who wrote Hamlet?',
      option1: 'Charles Dickens',
      option2: 'William Shakespeare',
      option3: 'Jane Austen',
      option4: 'Mark Twain',
      correctOption: 2,
      explanation: 'Hamlet was written by Shakespeare.'
    },
    {
      questionText: 'What is the boiling point of water at sea level (°C)?',
      option1: '90',
      option2: '100',
      option3: '110',
      option4: '120',
      correctOption: 2,
      explanation: 'Water boils at 100°C at sea level.'
    }
  ];

  for (const q of mcqQuestions) {
    const question = await prisma.question.create({
      data: {
        domainId: firstSubdomain.domainId,
        subdomainId: firstSubdomain.id,
        questionTypeId: mcqType.id,
        difficultyLevel: 'EASY',
        isActive: true,
        mcqStandard: {
          create: q
        }
      }
    });
    console.log(' Seeded MCQStandard question:', question.id);
  }
}

  console.log(' Seeding completed successfully.')
  console.log('   - Created/Updated 2 Domains')
  console.log('   - Created/Updated 1 Candidate')
  console.log('   - Assigned random raw scores')

  console.log('\n==================================================================');
  console.log('👤 GENERATED TEST USERS (Verified & Ready to Login)');
  console.log('==================================================================');
  console.log('TYPE        | EMAIL                          | PASSWORD');
  console.log('------------|--------------------------------|--------------------');
  console.log('Recruiter   | testing.internhire@gmail.com   | DanDaDan@360%');
  for (let i = 1; i <= 1; i++) {
    console.log(`Candidate ${i} | test_candidate_${i}@example.com    | password123`);
  }
  console.log('==================================================================\n');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
