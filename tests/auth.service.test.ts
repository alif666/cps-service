import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../src/auth/service';
import { AuthRepository } from '../src/auth/types';
import { config } from '../src/config';

describe('AuthService', () => {
  const repository: jest.Mocked<AuthRepository> = { findByEmail: jest.fn() };
  const service = new AuthService(repository);

  beforeEach(() => jest.clearAllMocks());

  it('returns a signed token containing the user permissions', async () => {
    repository.findByEmail.mockResolvedValue({ id: 'user-1', email: 'admin@example.com', fullName: 'Admin', isActive: true, permissions: ['access.manage'], passwordHash: await bcrypt.hash('ChangeMe123!', 4) });
    const result = await service.login({ email: 'admin@example.com', password: 'ChangeMe123!' });
    const claims = jwt.verify(result.accessToken, config.jwtSecret) as { sub: string; permissions: string[] };
    expect(claims.sub).toBe('user-1');
    expect(claims.permissions).toEqual(['access.manage']);
  });

  it('rejects inactive users', async () => {
    repository.findByEmail.mockResolvedValue({ id: 'user-1', email: 'admin@example.com', fullName: 'Admin', isActive: false, permissions: [], passwordHash: 'hash' });
    await expect(service.login({ email: 'admin@example.com', password: 'ChangeMe123!' })).rejects.toThrow('Invalid credentials');
  });
});
