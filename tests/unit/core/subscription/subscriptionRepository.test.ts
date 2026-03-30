import { SubscriptionRepository } from '@/core/subscription/subscriptionRepository';
import { prisma } from '@/infra/db/prisma.client';
import { PricingSource, SubscriptionStatus } from '@/core/subscription/subscriptionService';

describe('SubscriptionRepository (Integration)', () => {
  const repo = new SubscriptionRepository();
  let testCandidateId: string;
  let testUserId: string;

  // 1. Setup: Create a real user in the DB for testing
  beforeAll(async () => {
    const timestamp = Date.now();
    const user = await prisma.user.create({
      data: {
        email: `repo_test_${timestamp}@example.com`,
        password: 'hashed_password',
        phone: `888${timestamp.toString().slice(-7)}`,
        name: 'Repo Test User',
        candidateProfile: {
          create: {
            city: 'Test City',
          },
        },
      },
      include: { candidateProfile: true },
    });
    testUserId = user.id;
    testCandidateId = user.candidateProfile!.id;
  });

  // 2. Cleanup: Delete the test user and their data
  afterAll(async () => {
    if (testCandidateId) {
      await prisma.subscription.deleteMany({ where: { candidateId: testCandidateId } });
      await prisma.candidateProfile.delete({ where: { id: testCandidateId } });
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
    await prisma.$disconnect();
  });

  // Ensure isolation between tests by clearing subscriptions
  beforeEach(async () => {
    if (testCandidateId) {
      await prisma.subscription.deleteMany({ where: { candidateId: testCandidateId } });
    }
  });

  // 3. Tests
  it('should create a PENDING subscription', async () => {
    const sub = await repo.create({
      candidateId: testCandidateId,
      pricePaid: 100,
      pricingSource: PricingSource.DEFAULT,
      status: SubscriptionStatus.PENDING,
      expiresAt: new Date(Date.now() + 100000),
    });

    expect(sub.id).toBeDefined();
    expect(sub.status).toBe(SubscriptionStatus.PENDING);
    expect(sub.candidateId).toBe(testCandidateId);

    // Verify directly in Prisma to ensure it persisted
    const saved = await prisma.subscription.findUnique({ where: { id: sub.id } });
    expect(saved).not.toBeNull();
  });

  it('should activate a subscription', async () => {
    // Create pending
    const sub = await repo.create({
      candidateId: testCandidateId,
      pricePaid: 100,
      pricingSource: PricingSource.DEFAULT,
      status: SubscriptionStatus.PENDING,
      expiresAt: new Date(Date.now() + 100000),
    });

    // Activate
    const activated = await repo.activate(sub.id);

    expect(activated.status).toBe(SubscriptionStatus.ACTIVE);
    expect(activated.startedAt).not.toBeNull();
  });

  it('should find active subscription only if not expired', async () => {
    // Create an EXPIRED active subscription
    await repo.create({
      candidateId: testCandidateId,
      pricePaid: 100,
      pricingSource: PricingSource.DEFAULT,
      status: SubscriptionStatus.ACTIVE,
      expiresAt: new Date(Date.now() - 10000), // Past date
    });

    // Should return null because it's expired
    let found = await repo.findFirstActiveByCandidate(testCandidateId);
    expect(found).toBeNull();

    // Create a VALID active subscription
    const validSub = await repo.create({
      candidateId: testCandidateId,
      pricePaid: 100,
      pricingSource: PricingSource.DEFAULT,
      status: SubscriptionStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 100000), // Future date
    });

    // Should return the valid one
    found = await repo.findFirstActiveByCandidate(testCandidateId);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(validSub.id);
  });
});