import { Router } from 'express';
import { DoaService } from './service';
export const doaRouter = (service: DoaService) => { const router = Router(); router.get('/', async (_req, res, next) => { try { res.json({ data: await service.list() }); } catch (e) { next(e); } }); router.post('/', async (req, res, next) => { try { res.status(201).json({ data: await service.create(req.body) }); } catch (e) { next(e); } }); return router; };
