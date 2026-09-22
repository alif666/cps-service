import { Router } from 'express';
import { AuthService } from './service';
export const authRouter = (service: AuthService) => { const router = Router(); router.post('/login', async (req, res, next) => { try { res.json({ data: await service.login(req.body) }); } catch (e) { next(e); } }); return router; };
