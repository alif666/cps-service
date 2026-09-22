import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../src/auth/service';
import { AuthRepository } from '../src/auth/types';
import { config } from '../src/config';

describe('AuthService', () => {
  const repository: jest.Mocked<AuthRepository> = { findByEmail: jest.fn() };
  const service = new AuthService(repository);

  beforeEach(() => jest.clearAllMocks());

  it('returns a signed token containing scoped roles and inherited permissions', async () => {
    const roles = [{ code: 'UNIT_HEAD', companyId: 'company-1', businessUnitId: 'unit-1' }];
    repository.findByEmail.mockResolvedValue({ id: 'user-1', email: 'admin@example.com', fullName: 'Admin', isActive: true, roles, permissions: ['access.manage'], passwordHash: await bcrypt.hash('ChangeMe123!', 4) });
    const result = await service.login({ email: 'admin@example.com', password: 'ChangeMe123!' });
    const claims = jwt.verify(result.accessToken, config.jwtSecret) as { sub: string; roles: typeof roles; permissions: string[] };
    expect(claims.sub).toBe('user-1');
    expect(claims.roles).toEqual(roles);
    expect(claims.permissions).toEqual(['access.manage']);
  });

  it('rejects inactive users', async () => {
    repository.findByEmail.mockResolvedValue({ id: 'user-1', email: 'admin@example.com', fullName: 'Admin', isActive: false, roles: [], permissions: [], passwordHash: 'hash' });
    await expect(service.login({ email: 'admin@example.com', password: 'ChangeMe123!' })).rejects.toThrow('Invalid credentials');
  });
});
