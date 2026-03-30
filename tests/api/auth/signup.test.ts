import { POST } from '@/app/api/auth/signup/route';
import { prisma } from '@/infra/db/prisma.client';
import { NextResponse } from 'next/server';

// ------------------------------------------------------------------
// Mocks
// ------------------------------------------------------------------
jest.mock('@/infra/db/prisma.client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    candidateProfile: {
      create: jest.fn(),
    },
    recruiterProfile: {
      create: jest.fn(),
    },
  },
}));

// Mock bcrypt if used directly in the route, otherwise the real library runs (which is fine)
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
}));

describe('API Route: POST /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validSignupBody = {
    email: 'newuser@example.com',
    password: 'password123',
    role: 'CANDIDATE',
    name: 'John Doe',
  };

  test('Should create a new user and return 201 when data is valid', async () => {
    // Setup: User does not exist
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    
    // Setup: Create returns the new user
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: validSignupBody.email,
      role: validSignupBody.role,
    });

    // Act
    const req = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(validSignupBody),
    });
    const response = await POST(req);
    const json = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(json).toHaveProperty('success', true);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: validSignupBody.email,
          // We expect the password to be hashed, checking logic depends on implementation
        }),
      })
    );
  });

  test('Should return 409 if user already exists', async () => {
    // Setup: User already exists
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'existing-123',
      email: validSignupBody.email,
    });

    // Act
    const req = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(validSignupBody),
    });
    const response = await POST(req);
    const json = await response.json();

    // Assert
    expect(response.status).toBe(409); // Conflict
    expect(json.message).toMatch(/already exists/i);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test('Should return 400 if required fields are missing', async () => {
    // Act: Missing password
    const req = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(400);
  });
});
