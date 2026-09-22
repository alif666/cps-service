import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config';
import { AuthRepository } from './types';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export class AuthService {
  constructor(private readonly repository: AuthRepository) {}
  async login(input: unknown) {
    const credentials = loginSchema.parse(input);
    const user = await this.repository.findByEmail(credentials.email);
    if (!user || !user.isActive || !user.passwordHash || !(await bcrypt.compare(credentials.password, user.passwordHash))) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    const token = jwt.sign({ sub: user.id, email: user.email, roles: user.roles, permissions: user.permissions }, config.jwtSecret, { expiresIn: '1h' });
    return { accessToken: token, user: { id: user.id, email: user.email, fullName: user.fullName, roles: user.roles, permissions: user.permissions } };
  }
}
