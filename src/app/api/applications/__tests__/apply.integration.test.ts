import { POST } from '../route';
import { prisma } from '@/infra/db/prisma.client';
import { getSessionUser } from '@/core/auth/authUtils';
import { randomUUID } from 'crypto';

// Mock auth to control the session user
jest.mock('@/core/auth/authUtils', () => ({
  getSessionUser: jest.fn(),
}));

describe('POST /api/applications Integration', () => {
  const testRunId = randomUUID();
  let recruiterUserId: string;
  let recruiterProfileId: string;
  let establishmentId: string;
  let jobId: string;

  let candidateUserId: string;
  let candidateProfileId: string;

  // Setup Recruiter and Job (shared for tests)
  beforeAll(async () => {
    // 1. Create Recruiter User
    const recruiterUser = await prisma.user.create({
      data: {
        email: `recruiter-${testRunId}@test.com`,
        name: 'Test Recruiter',
        password: 'hashedpassword',
        phone: `9999999999`,
      },
    });
    recruiterUserId = recruiterUser.id;

    // 2. Create Establishment
    const establishment = await prisma.establishment.create({
      data: {
        name: 'Test Corp',
        type: 'COMPANY_PVT_LTD',
      },
    });
    establishmentId = establishment.id;

    // 3. Create Recruiter Profile
    const recruiterProfile = await prisma.recruiterProfile.create({
      data: {
        userId: recruiterUserId,
        establishmentId: establishmentId,
        jobsPostedThisMonth: 0,
      },
    });
    recruiterProfileId = recruiterProfile.id;

    // 4. Create Job Listing
    const job = await prisma.jobListing.create({
      data: {
        recruiterId: recruiterProfileId,
        title: 'Software Intern',
        description: 'Great job',
        stipendAmount: 10000,
        locationCity: 'Remote',
        workMode: 'REMOTE_ANYWHERE',
        type: 'INTERNSHIP_FULL_TIME',
        status: 'APPROVED',
        deadline: new Date(Date.now() + 86400000), // 1 day future
      },
    });
    jobId = job.id;
  });

  // Cleanup after all tests
  afterAll(async () => {
    // Delete Job
    if (jobId) await prisma.jobListing.delete({ where: { id: jobId } });
    // Delete Recruiter
    if (recruiterProfileId) await prisma.recruiterProfile.delete({ where: { id: recruiterProfileId } });
    if (establishmentId) await prisma.establishment.delete({ where: { id: establishmentId } });
    if (recruiterUserId) await prisma.user.delete({ where: { id: recruiterUserId } });
  });

  // Per-test Candidate Setup/Teardown
  beforeEach(async () => {
    // Create Candidate User
    const user = await prisma.user.create({
      data: {
        email: `candidate-${randomUUID()}@test.com`,
        name: 'Test Candidate',
        password: 'hashedpassword',
        phone: '9876543210',
      },
    });
    candidateUserId = user.id;

    // Create Candidate Profile
    const profile = await prisma.candidateProfile.create({
      data: {
        userId: candidateUserId,
        dob: new Date('2000-01-01'),
        internshipsSubscriptionExpiry: new Date(Date.now() + 10000000), // Future date
        canApplyToJobs: false, // Default
      },
    });
    candidateProfileId = profile.id;

    // Create Education records to pass Readiness Check
    await prisma.tenthEducation.create({
      data: { candidateId: candidateProfileId, percentageMarks: 90, passingYear: 2016 },
    });
    await prisma.twelfthEducation.create({
      data: { candidateId: candidateProfileId, percentageMarks: 90, passingYear: 2018 },
    });
    await prisma.uGEducation.create({
      data: { candidateId: candidateProfileId, courseName: 'B.Tech', department: 'CS', cgpa: 9.0, joinYear: 2018, completionYear: 2022 },
    });
  });

  afterEach(async () => {
    // Cleanup Candidate Data
    if (candidateProfileId) {
      await prisma.subscription.deleteMany({ where: { candidateId: candidateProfileId } });
      await prisma.application.deleteMany({ where: { candidateId: candidateProfileId } });
      await prisma.tenthEducation.deleteMany({ where: { candidateId: candidateProfileId } });
      await prisma.twelfthEducation.deleteMany({ where: { candidateId: candidateProfileId } });
      await prisma.uGEducation.deleteMany({ where: { candidateId: candidateProfileId } });
      await prisma.candidateProfile.delete({ where: { id: candidateProfileId } });
    }
    if (candidateUserId) {
      await prisma.user.delete({ where: { id: candidateUserId } });
    }
  });

  it('should return 403 when candidate does NOT have an active subscription', async () => {
    // Mock Session
    (getSessionUser as jest.Mock).mockResolvedValue({
      id: candidateUserId,
      role: 'CANDIDATE',
      candidateProfile: { id: candidateProfileId },
    });

    const req = new Request('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('SUBSCRIPTION_REQUIRED');
  });

  it('should return 200 and create application when candidate HAS an active subscription', async () => {
    // Create Active Subscription
    await prisma.subscription.create({
      data: {
        candidateId: candidateProfileId,
        status: 'ACTIVE',
        pricingSource: 'DEFAULT',
        pricePaid: 1199,
        expiresAt: new Date(Date.now() + 10000000), // Future
      },
    });

    // Mock Session
    (getSessionUser as jest.Mock).mockResolvedValue({
      id: candidateUserId,
      role: 'CANDIDATE',
      candidateProfile: { id: candidateProfileId },
    });

    const req = new Request('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.application).toBeDefined();
    expect(body.application.status).toBe('APPLIED');
  });

  it('should return 403 when candidate has an EXPIRED subscription', async () => {
    // Create Expired Subscription
    await prisma.subscription.create({
      data: {
        candidateId: candidateProfileId,
        status: 'ACTIVE',
        pricingSource: 'DEFAULT',
        pricePaid: 1199,
        expiresAt: new Date(Date.now() - 10000000), // Past
      },
    });

    // Mock Session
    (getSessionUser as jest.Mock).mockResolvedValue({
      id: candidateUserId,
      role: 'CANDIDATE',
      candidateProfile: { id: candidateProfileId },
    });

    const req = new Request('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('SUBSCRIPTION_REQUIRED');
  });
});