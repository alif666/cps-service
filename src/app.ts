import express, {ErrorRequestHandler} from 'express';
import {pool} from './db/pool';
import {PostgresOrganizationRepository} from './modules/organization/repository';
import {organizationRouter} from './modules/organization/routes';
import {OrganizationService} from './modules/organization/service';

export const createApp = () => {
    const app = express();
    app.use(express.json());
    app.get('/health', (_req, res) => res.json({status: 'ok'}));

    const organizationService = new OrganizationService(new PostgresOrganizationRepository(pool));
    app.use('/api/v1/organizations', organizationRouter(organizationService));

    const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
        if (error?.name === 'ZodError') return res.status(400).json({
            error: 'Validation failed',
            details: error.issues
        });
        if (error?.code === '23505') return res.status(409).json({error: 'A record with the same unique value already exists'});
        if (error?.message === 'Organization not found') return res.status(404).json({error: error.message});
        console.error(error);
        return res.status(500).json({error: 'Internal server error'});
    };
    app.use(errorHandler);
    return app;
};
