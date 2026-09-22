import {Router} from 'express';
import {z} from 'zod';
import {OrganizationService} from './service';

export const organizationRouter = (service: OrganizationService): Router => {
    const router = Router();

    router.get('/', async (_req, res, next) => {
        try {
            res.json({data: await service.list()});
        } catch (error) {
            next(error);
        }
    });

    router.post('/', async (req, res, next) => {
        try {
            res.status(201).json({data: await service.create(req.body)});
        } catch (error) {
            next(error);
        }
    });

    router.patch('/:id/status', async (req, res, next) => {
        try {
            const input = z.object({isActive: z.boolean()}).parse(req.body);
            res.json({data: await service.setActive(req.params.id, input.isActive)});
        } catch (error) {
            next(error);
        }
    });

    return router;
};
