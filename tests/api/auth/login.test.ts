import { POST } from '@/app/api/auth/login/route';
import { prisma } from '@/infra/db/prisma.client';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

// ------------------------------------------------------------------
// Mocks
// ------------------------------------------------------------------
jest.mock('@/infra/db/prisma.client', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock next/headers to verify cookie setting
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock bcrypt for password comparison
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));



describe('API Route: POST /api/auth/login', () => {
  let mockCookieStore: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Cookie Store Mock
    mockCookieStore = {
      set: jest.fn(),
      get: jest.fn(),
    };
    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
  });

  const validLoginBody = {
    email: 'user@example.com',
    password: 'password123',
  };

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    passwordHash: 'hashed_password_123',
    role: 'CANDIDATE',
  };

  test('Should login successfully and set cookies for valid credentials', async () => {
    // Setup: User found
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    // Setup: Password matches
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Act
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(validLoginBody),
    });
    const response = await POST(req);
    const json = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(json).toHaveProperty('success', true);
    
    // Verify Cookies were set (Auth Token & Role)
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'auth_user', 
      mockUser.id, 
      expect.any(Object)
    );
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'auth_role', 
      mockUser.role, 
      expect.any(Object)
    );
  });

  test('Should return 401 for invalid password', async () => {
    // Setup: User found
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    // Setup: Password does NOT match
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(validLoginBody),
    });
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(401);
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });

  test('Should return 404/401 if user does not exist', async () => {
    // Setup: User not found
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(validLoginBody),
    });
    const response = await POST(req);

    // Assert
    // Some implementations return 404, others 401 to avoid enumeration. 
    // Adjust expectation based on your specific implementation.
    expect([401, 404]).toContain(response.status);
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });
});
