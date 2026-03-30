import { ReferralRepository } from '@/core/referral/referralRepository';
import { prisma } from '@/infra/db/prisma.client';

describe('ReferralRepository (Integration)', () => {
  const repo = new ReferralRepository();
  
  // Keep track of created users to clean up after tests
  const createdUserIds: string[] = [];

  // Helper to create a candidate for testing
  async function createTestCandidate(name: string) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const user = await prisma.user.create({
      data: {
        email: `ref_test_${name}_${timestamp}_${random}@example.com`,
        password: 'hash',
        phone: `777${timestamp.toString().slice(-5)}${random}`,
        name: `Ref Test ${name}`,
        candidateProfile: {
          create: { city: 'Test City' }
        }
      },
      include: { candidateProfile: true }
    });
    createdUserIds.push(user.id);
    return user.candidateProfile!.id;
  }

  afterAll(async () => {
    // Cleanup in reverse order of dependency
    // 1. Find candidates to get their IDs
    const candidates = await prisma.candidateProfile.findMany({
        where: { userId: { in: createdUserIds } }
    });
    const candidateIds = candidates.map(c => c.id);
    
    // 2. Delete Referrals (dependent on candidates)
    await prisma.referral.deleteMany({ where: { candidateId: { in: candidateIds } } });
    
    // 3. Delete Profiles
    await prisma.candidateProfile.deleteMany({ where: { id: { in: candidateIds } } });
    
    // 4. Delete Users
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    
    await prisma.$disconnect();
  });

  it('should create and retrieve a referral', async () => {
    const candidateId = await createTestCandidate('A');
    const code = `CODE_${Date.now()}`;
    
    const created = await repo.create({
        candidateId,
        referralCode: code
    });
    
    expect(created.referralCode).toBe(code);
    expect(created.candidateId).toBe(candidateId);
    
    const found = await repo.findByReferralCode(code);
    expect(found?.id).toBe(created.id);
  });

  it('should correctly resolve referral chain', async () => {
    // Setup Chain: C -> B -> A
    // C is referred by B, B is referred by A
    const idA = await createTestCandidate('ChainA');
    const idB = await createTestCandidate('ChainB');
    const idC = await createTestCandidate('ChainC');

    // Create Referrals
    // A has no referrer
    await repo.create({ candidateId: idA, referralCode: `A_${Date.now()}` });
    
    // B referred by A
    await repo.create({ candidateId: idB, referralCode: `B_${Date.now()}`, referrerId: idA });
    
    // C referred by B
    await repo.create({ candidateId: idC, referralCode: `C_${Date.now()}`, referrerId: idB });

    // Test Chain for C (should find B as L1, A as L2)
    const chain = await repo.getReferralChain(idC, 2);
    
    expect(chain).toHaveLength(2);
    
    // Level 1: Direct Referrer (B)
    expect(chain[0].candidateId).toBe(idB);
    expect(chain[0].level).toBe(1);
    expect(chain[0].referralCode).toContain('B_');
    
    // Level 2: Indirect Referrer (A)
    expect(chain[1].candidateId).toBe(idA);
    expect(chain[1].level).toBe(2);
    expect(chain[1].referralCode).toContain('A_');
  });
});
