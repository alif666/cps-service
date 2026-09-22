import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authenticate, requirePermission } from '../src/middleware/auth';
import { config } from '../src/config';

const app = () => {
  const instance = express();
  instance.get('/protected', authenticate, requirePermission('access.manage'), (_req, res) => res.json({ ok: true }));
  instance.use((error: any, _req: any, res: any, _next: any) => res.status(error.statusCode ?? 500).json({ error: error.message }));
  return instance;
};

describe('authorization middleware', () => {
  it('rejects requests without a bearer token', async () => {
    await request(app()).get('/protected').expect(401);
  });

  it('rejects a valid token without the required permission', async () => {
    const token = jwt.sign({ sub: 'user-1', roles: [], permissions: [] }, config.jwtSecret);
    await request(app()).get('/protected').set('Authorization', `Bearer ${token}`).expect(403);
  });
});
