import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Schema Foreign Key Constraints', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should fail to delete a User if a dependent RecruiterProfile exists', async () => {
    // 1. Setup: Create a Parent Record (User)
    // Using unique values for email/phone to avoid collisions with existing data
    const timestamp = Date.now();
    const user = await prisma.user.create({
      data: {
        email: `fk_test_${timestamp}@example.com`,
        phone: `999${timestamp.toString().slice(-7)}`,
        password: 'secure_password_hash',
        name: 'FK Constraint Test User',
      },
    });

    // 2. Setup: Create a Dependency (Establishment) required for RecruiterProfile
    const establishment = await prisma.establishment.create({
      data: {
        type: 'COMPANY_PVT_LTD',
        name: 'FK Test Establishment',
      },
    });

    // 3. Setup: Create a Child Record (RecruiterProfile) linked to the User
    const recruiter = await prisma.recruiterProfile.create({
      data: {
        userId: user.id,
        establishmentId: establishment.id,
      },
    });

    // 4. Action & Assertion: Attempt to delete the User
    // This should fail because RecruiterProfile depends on User, and the schema
    // does not specify `onDelete: Cascade`.
    try {
      await prisma.user.delete({
        where: { id: user.id },
      });
      // If we reach this line, the constraint failed to enforce
      throw new Error('User deletion should have failed due to foreign key constraint, but it succeeded.');
    } catch (error: any) {
      // P2003 is the Prisma error code for "Foreign key constraint failed"
      expect(error.code).toBe('P2003');
    }

    // 5. Cleanup: Delete records in correct order (Child -> Parent)
    // We must delete the recruiter profile first to allow user deletion
    await prisma.recruiterProfile.delete({ where: { id: recruiter.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.establishment.delete({ where: { id: establishment.id } });
  });
});